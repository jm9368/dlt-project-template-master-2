// Use this script to generate the API bindings using the swagger documentation

"use strict";

const Path = require("path");
const FS = require("fs");
const SwaggerGenerator = require("@asanrom/express-swagger-generator");

const SwaggerDefinition = SwaggerGenerator({ use: () => { } }, {
    swaggerDefinition: {
        info: {
            description: 'API documentation',
            title: "Generator",
            version: '1.0.0',
        },
        host: 'localhost',
        basePath: '/api/v1',
        produces: [
            "application/json"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            AuthToken: {
                type: "apiKey",
                in: "header",
                name: "x-session-id",
            },
        },
    },
    basedir: Path.resolve(__dirname, ".."), // App absolute path
    files: ['./src/controllers/api/**/*.ts'] // Path to the API handle folder
});

function parseType(data) {
    if (!data) {
        return "any";
    }

    let type = data.type || "any";

    if (type === "integer") {
        type = "number";
    } else if (type === "object") {
        type = "any";
    }

    if (data.$ref) {
        type = (data.$ref + "").split("/").pop();
    } else if (type === "array") {
        type = parseType(data.items) + "[]";
    } else if (data.enum && Array.isArray(data.enum) && data.enum.length > 0) {
        type = data.enum.map(m => JSON.stringify(m)).join(" | ");
    }

    return type;
}

function generateDefinitions(destFile) {
    const definitions = SwaggerDefinition.definitions;
    const lines = [];

    lines.push('// API definitions (Auto generated)');
    lines.push('');
    lines.push('"use strict"');
    lines.push('');

    //console.log(JSON.stringify(definitions));

    for (let def of Object.keys(definitions)) {
        const defProps = definitions[def];

        if (defProps.description) {
            lines.push('/**')
            const descLines = (defProps.description + "").split("\n");
            for (let dl of descLines) {
                lines.push(' * ' + dl);
            }
            lines.push(' */');
        }

        lines.push('export interface ' + def + ' {');

        let isFirst = true;

        for (let prop of Object.keys(defProps.properties)) {
            if (isFirst) {
                isFirst = false;
            } else {
                lines.push('');
            }

            const propData = defProps.properties[prop];
            const isRequired = (defProps.required || []).includes(prop);

            if (propData.description) {
                lines.push('    /**')
                const descLines = (propData.description + "").split("\n");
                for (let dl of descLines) {
                    lines.push('     * ' + dl);
                }
                lines.push('     */');
            }

            const type = parseType(propData)

            lines.push('    ' + prop + (isRequired ? "" : "?") + ": " + type + ";");
        }

        lines.push('}')
        lines.push('');
    }

    FS.writeFileSync(destFile, lines.join("\n") + "\n");
    console.log("Wrote definitions file: " + destFile);
}

function groupNameToFileName(str) {
    return str.replace(/_/g, "-").replace(/\s/g, "-").replace(/[^a-z0-9-]/gi, "");
}

function groupToClassName(group) {
    return groupNameToFileName(group).split("-").map(a => a.charAt(0).toUpperCase() + a.substring(1).toLowerCase()).join("");
}

function routeToFunctionName(route, method) {
    return (method.charAt(0).toUpperCase() + method.substring(1).toLowerCase()) + route.split("/").slice(1).map(r => {
        r = r.replace(/[^a-z0-9]/gi, "");
        return r.charAt(0).toUpperCase() + r.substring(1).toLowerCase();
    }).join("");
}

function errorCodeToFunctionName(code) {
    return code.replace(/-/g, "_").split("_").map(r => {
        return r.charAt(0).toUpperCase() + r.substring(1).toLowerCase();
    }).join("");
}

function parseSchema(schema, usedImports) {
    if (!schema) {
        return "any";
    }

    let type = schema.type || "any";

    if (type === "integer") {
        type = "number";
    }

    if (schema.$ref) {
        type = (schema.$ref + "").split("/").pop();
        if (!usedImports.includes(type)) {
            usedImports.push(type);
        }
    } else if (type === "array") {
        type = parseSchema(schema.items, usedImports) + "[]";
    } else if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
        type = schema.enum.map(m => JSON.stringify(m)).join(" | ");
    } else if (schema.properties) {
        type = '{ ' + Object.keys(schema.properties).map(prop => prop + ": " + parseSchema(schema.properties[prop], usedImports)).join(", ") + ' }'
    }

    return type;
}

function preparePathString(path) {
    let res = "`";

    let state = 0;
    let param = "";

    for (let i = 0; i < path.length; i++) {
        const c = path.charAt(i);
        if (state === 0) {
            if (c === "{") {
                param = "";
                state = 1;
            } else {
                res += c;
            }
        } else {
            if (c === "}") {
                state = 0;
                res += '${encodeURIComponent(' + param + ')}';
            } else {
                param += c;
            }
        }
    }

    return res + '`';
}

function generateAPIBindings(basePath, requestLibrary, engine) {
    const apiGroups = [""];
    const apiGroupPaths = Object.create(null);

    apiGroupPaths[""] = Object.create(null);

    let fileType = "File";

    if (engine === "node") {
        fileType = "Readable | Buffer"
    } else if (engine === "mobile") {
        fileType = "UploadableFile";
    }

    for (let path of Object.keys(SwaggerDefinition.paths)) {
        for (let method of Object.keys(SwaggerDefinition.paths[path])) {
            const tag = SwaggerDefinition.paths[path][method].tags ? SwaggerDefinition.paths[path][method].tags[0] : "";

            if (!tag) {
                if (!apiGroupPaths[""][path]) {
                    apiGroupPaths[""][path] = Object.create(null);
                }

                if (!apiGroupPaths[""][path][method]) {
                    apiGroupPaths[""][path][method] = Object.create(null);
                }

                apiGroupPaths[""][path][method] = SwaggerDefinition.paths[path][method];
                continue;
            }

            if (!apiGroups.includes(tag)) {
                apiGroups.push(tag);
            }

            if (!apiGroupPaths[tag]) {
                apiGroupPaths[tag] = Object.create(null);
            }

            if (!apiGroupPaths[tag][path]) {
                apiGroupPaths[tag][path] = Object.create(null);
            }

            if (!apiGroupPaths[tag][path][method]) {
                apiGroupPaths[tag][path][method] = Object.create(null);
            }

            apiGroupPaths[tag][path][method] = SwaggerDefinition.paths[path][method];
        }
    }

    for (let group of apiGroups) {
        const destFile = Path.resolve(basePath, "api-" + (group ? ("group-" + groupNameToFileName(group)) : "no-group") + ".ts");
        const usedDefinitions = [];
        const usedLibraryImports = ["RequestErrorHandler", "RequestParams"];
        const usedUtils = ["getApiUrl"];

        let usesFormData = false;
        let usesFileParameter = false;
        const paths = apiGroupPaths[group];

        if (Object.keys(paths).length === 0) {
            continue;
        }

        const linesExtraTypes = [];
        const lines = [];

        lines.push('// API bindings: ' + group + " (Auto generated)");
        lines.push('');
        lines.push('"use strict";');
        lines.push('');
        lines.push('import {} from "' + requestLibrary + '";');
        lines.push('import {} from "./utils";');
        lines.push('import {} from "./definitions";');
        lines.push('');

        lines.push('export class Api' + groupToClassName(group) + " {");

        let isFirst = true;

        for (let path of Object.keys(paths)) {
            for (let method of Object.keys(paths[path])) {
                const apiDef = paths[path][method];
                const pathParameters = [];
                const queryParameters = [];
                const formDataParameters = [];
                const headerParameters = [];
                let bodyParamType = '';

                const errorCases = [];

                if (isFirst) {
                    isFirst = false;
                } else {
                    lines.push('');
                }

                const tab = "    ";

                // Find return type

                let returnType = "void";

                const responses = apiDef.responses;

                if (responses && responses["200"]) {
                    const schema = responses["200"].schema;

                    if (schema) {
                        returnType = parseSchema(schema, usedDefinitions);
                    }
                }

                // Parameters

                const paramsList = apiDef.parameters;

                for (let param of paramsList) {
                    switch (param.in) {
                        case "path":
                            {
                                pathParameters.push({
                                    name: param.name,
                                    required: !!param.required,
                                    description: param.description || "",
                                    type: parseSchema(param.schema || { type: param.type }, usedDefinitions),
                                });
                            }
                            break;
                        case "query":
                            {
                                queryParameters.push({
                                    name: param.name,
                                    required: !!param.required,
                                    description: param.description || "",
                                    type: parseSchema(param.schema || { type: param.type }, usedDefinitions),
                                });
                            }
                            break;
                        case "body":
                            {
                                bodyParamType = parseSchema(param.schema || { type: param.type }, usedDefinitions);
                            }
                            break;
                        case "formData":
                            {
                                usesFormData = true;
                                if (param.type === "file") {
                                    usesFileParameter = true;
                                }
                                if (engine === "mobile" && !usedUtils.includes("UploadableFile")) {
                                    usedUtils.push("UploadableFile");
                                }
                                if (engine === "mobile" && !usedUtils.includes("appendFileToForm")) {
                                    usedUtils.push("appendFileToForm");
                                }
                                formDataParameters.push({
                                    name: param.name,
                                    required: !!param.required,
                                    description: param.description || "",
                                    type: param.type === "file" ? fileType : parseSchema(param.schema || { type: param.type }, usedDefinitions),
                                });
                            }
                            break;
                        case "header":
                            {
                                headerParameters.push({
                                    name: param.name,
                                    required: !!param.required,
                                    description: param.description || "",
                                    type: parseSchema(param.schema || { type: param.type }, usedDefinitions),
                                });
                            }
                            break;
                    }
                }

                // Name and description

                let methodName = routeToFunctionName(path, method);

                const desc = apiDef.description;

                lines.push(tab + "/**");

                lines.push(tab + ' * Method: ' + method.toUpperCase());
                lines.push(tab + ' * Path: ' + path);

                if (desc) {
                    desc.split("\n").forEach(dl => {
                        dl = dl.trim();
                        if (!dl) {
                            return;
                        }

                        if (dl.startsWith("Binding: ")) {
                            methodName = (dl.split(":")[1] || "").replace(/[^a-z0-9]/gi, "") || methodName;
                            return;
                        }

                        lines.push(tab + " * " + dl);
                    });
                }

                // Error cases

                let baseError = '';
                let generalErrorCases = [500];

                errorCases.unshift({
                    status: '*',
                    code: '*',
                    handleLogic: '"networkError" in handler ? handler.networkError : handler.temporalError',
                });

                errorCases.unshift({
                    status: 500,
                    code: '*',
                    handleLogic: '"serverError" in handler ? handler.serverError : handler.temporalError',
                });

                if (apiDef.security && apiDef.security.length > 0) {
                    baseError = 'CommonAuthenticatedErrorHandler';
                    if (!usedLibraryImports.includes("CommonAuthenticatedErrorHandler")) {
                        usedLibraryImports.push('CommonAuthenticatedErrorHandler');
                    }

                    generalErrorCases.push(401);

                    errorCases.unshift({
                        status: 401,
                        code: '*',
                        handleLogic: 'handler.unauthorized',
                    });
                } else {
                    baseError = 'CommonErrorHandler';
                    if (!usedLibraryImports.includes("CommonErrorHandler")) {
                        usedLibraryImports.push('CommonErrorHandler');
                    }
                }

                let errorType = baseError;

                if (responses) {
                    let customErrorCases = [];

                    for (let errorStatusStr of Object.keys(responses)) {
                        const errorStatus = parseInt(errorStatusStr, 10);

                        if (isNaN(errorStatus) || errorStatus === 200) {
                            continue;
                        }

                        let baseCase = "status" + errorStatus;

                        switch (errorStatus) {
                            case 400:
                                baseCase = "badRequest"
                                break;
                            case 400:
                                baseCase = "unauthorized"
                                break;
                            case 403:
                                baseCase = "forbidden"
                                break;
                            case 404:
                                baseCase = "notFound"
                                break;
                            case 413:
                                baseCase = "payLoadTooLarge"
                                break;
                            case 429:
                                baseCase = "tooManyRequests"
                                break;
                            case 500:
                                baseCase = "serverError"
                                break;
                        }

                        if (!generalErrorCases.includes(errorStatus)) {
                            generalErrorCases.push(errorStatus);

                            errorCases.unshift({
                                status: errorStatus,
                                code: '*',
                                handleLogic: 'handler.' + baseCase,
                            });

                            customErrorCases.push({
                                name: baseCase,
                                description: 'General handler for status = ' + errorStatus,
                            });
                        }

                        // Check for custom error codes

                        const responseDef = responses[errorStatusStr];

                        let foundSchema = false;

                        if (responseDef.schema && responseDef.schema.$ref) {
                            // Find ref
                            const refName = responseDef.schema.$ref.split("/").pop();
                            const definition = SwaggerDefinition.definitions[refName];

                            if (definition && definition.properties && definition.properties.code && definition.properties.code.type === "string" && definition.properties.code.description) {
                                let errorDescLines = definition.properties.code.description.split("\n").slice(1);

                                errorDescLines.forEach(dl => {
                                    dl = dl.trim();

                                    if (!dl) {
                                        return;
                                    }

                                    if ((/[^a-z0-9\_]/).test(dl.charAt(0))) {
                                        dl = dl.substring(1).trim();
                                    }

                                    const eCode = dl.split(":")[0];
                                    const eDescription = dl.split(":").slice(1).join(":").trim();

                                    errorCases.unshift({
                                        status: errorStatus,
                                        code: eCode,
                                        handleLogic: 'handler.' + baseCase + errorCodeToFunctionName(eCode),
                                    });

                                    customErrorCases.push({
                                        name: baseCase + errorCodeToFunctionName(eCode),
                                        description: eDescription,
                                    });

                                    foundSchema = true;
                                });
                            }
                        }

                        if (!foundSchema && responseDef.description) {
                            const sanitizedDescription = responseDef.description.replace(/[\n\r\t]/g, "");
                            if (sanitizedDescription.indexOf(":") >= 0) {
                                const errorCodesList = (sanitizedDescription.split(":")[1] || "").split(",").map(code => {
                                    code = code.trim().replace(/[^a-z0-9\_\-]/gi, "");
                                    return code;
                                }).filter(a => !!a);

                                if (errorCodesList.length > 0) {
                                    errorCodesList.forEach(ec => {
                                        errorCases.unshift({
                                            status: errorStatus,
                                            code: ec,
                                            handleLogic: 'handler.' + baseCase + errorCodeToFunctionName(ec),
                                        });

                                        customErrorCases.push({
                                            name: baseCase + errorCodeToFunctionName(ec),
                                            description: 'Handler for status = ' + errorStatus + ' and code = ' + ec,
                                        });
                                    });
                                }
                            }
                        }
                    }

                    if (customErrorCases.length > 0) {
                        // Make type

                        const typeName = methodName + "ErrorHandler";

                        linesExtraTypes.push("/**");
                        linesExtraTypes.push(" * Error handler for " + methodName);
                        linesExtraTypes.push(" */");

                        linesExtraTypes.push('export type ' + typeName + ' = ' + baseError + ' & {')

                        customErrorCases.forEach((c, i) => {
                            if (i > 0) {
                                linesExtraTypes.push('');
                            }
                            if (c.description) {
                                linesExtraTypes.push(tab + "/**");
                                c.description.split("\n").forEach(dl => {
                                    dl = dl.trim();

                                    if (!dl) {
                                        return;
                                    }
                                    linesExtraTypes.push(tab + " * " + dl);

                                });
                                linesExtraTypes.push(tab + " */");

                                linesExtraTypes.push(tab + c.name + ": () => void;")
                            }
                        });

                        linesExtraTypes.push('};');
                        linesExtraTypes.push('');

                        // Change error type
                        errorType = typeName;
                    }
                }

                // Parameters generation

                let methodParams = [];

                for (let pp of pathParameters) {
                    methodParams.push(pp.name + ": " + pp.type);
                    lines.push(tab + ' * @param ' + pp.name + ' ' + pp.description);
                }

                if (queryParameters.length > 0) {
                    if (!usedUtils.includes("generateURIQuery")) {
                        usedUtils.push("generateURIQuery");
                    }

                    // Model

                    linesExtraTypes.push("/**");
                    linesExtraTypes.push(" * Query parameters for " + methodName);
                    linesExtraTypes.push(" */");

                    linesExtraTypes.push('export interface ' + methodName + 'QueryParameters {');

                    queryParameters.forEach((q, i) => {
                        if (i > 0) {
                            linesExtraTypes.push('');
                        }

                        if (q.description) {
                            linesExtraTypes.push(tab + '/**');
                            q.description.split("\n").forEach(dl => {
                                dl = dl.trim();

                                if (!dl) {
                                    return;
                                }

                                linesExtraTypes.push(tab + ' * ' + dl);
                            });

                            linesExtraTypes.push(tab + ' */');
                        }

                        linesExtraTypes.push(tab + q.name + (q.required ? "" : "?") + ": " + q.type + ";");
                    });

                    linesExtraTypes.push('}');
                    linesExtraTypes.push('');

                    // Param

                    methodParams.push('queryParams: ' + methodName + 'QueryParameters');
                    lines.push(tab + ' * @param queryParams Query parameters');
                }

                if (bodyParamType) {
                    methodParams.push('body: ' + bodyParamType);
                    lines.push(tab + ' * @param body Body parameters');
                }

                if (formDataParameters.length > 0) {
                    methodParams.push('formParams: ' + methodName + 'FormParameters');
                    lines.push(tab + ' * @param formParams FromData parameters');
                }

                if (headerParameters.length > 0) {
                    // Model

                    linesExtraTypes.push("/**");
                    linesExtraTypes.push(" * Header parameters for " + methodName);
                    linesExtraTypes.push(" */");

                    linesExtraTypes.push('export interface ' + methodName + 'HeaderParameters {');

                    headerParameters.forEach((q, i) => {
                        if (i > 0) {
                            linesExtraTypes.push('');
                        }

                        if (q.description) {
                            linesExtraTypes.push(tab + '/**');
                            q.description.split("\n").forEach(dl => {
                                dl = dl.trim();

                                if (!dl) {
                                    return;
                                }

                                linesExtraTypes.push(tab + ' * ' + dl);
                            });

                            linesExtraTypes.push(tab + ' */');
                        }

                        linesExtraTypes.push(tab + JSON.stringify(q.name) + (q.required ? "" : "?") + ": " + q.type + ";");
                    });

                    linesExtraTypes.push('}');
                    linesExtraTypes.push('');

                    methodParams.push('headerParams: ' + methodName + 'HeaderParameters');
                    lines.push(tab + ' * @param headerParams Header parameters');
                }

                lines.push(tab + ' * @returns The request parameters')

                lines.push(tab + " */");

                // Method generation

                lines.push(tab + 'public static ' + methodName + '(' + methodParams.join(", ") + '): ' + 'RequestParams<' + returnType + ', ' + errorType + '> {');

                if (formDataParameters.length > 0) {

                    linesExtraTypes.push("/**");
                    linesExtraTypes.push(" * Form parameters for " + methodName);
                    linesExtraTypes.push(" */");

                    linesExtraTypes.push('export interface ' + methodName + 'FormParameters {');

                    formDataParameters.forEach((q, i) => {
                        if (i > 0) {
                            linesExtraTypes.push('');
                        }

                        if (q.description) {
                            linesExtraTypes.push(tab + '/**');
                            q.description.split("\n").forEach(dl => {
                                dl = dl.trim();

                                if (!dl) {
                                    return;
                                }

                                linesExtraTypes.push(tab + ' * ' + dl);
                            });

                            linesExtraTypes.push(tab + ' */');
                        }

                        linesExtraTypes.push(tab + q.name + (q.required ? "" : "?") + ": " + q.type + ";");
                    });

                    linesExtraTypes.push('}');
                    linesExtraTypes.push('');

                    lines.push(tab + tab + 'const formData = new FormData();');

                    lines.push('');

                    formDataParameters.forEach(p => {
                        if (engine === "mobile") {
                            lines.push(tab + tab + (p.required ? "" : ("formParams." + p.name + " !== undefined && ")) + 'appendFileToForm(formData, ' + JSON.stringify(p.name) + ", " + "formParams." + p.name + ");");
                        } else {
                            lines.push(tab + tab + (p.required ? "" : ("formParams." + p.name + " !== undefined && ")) + 'formData.append(' + JSON.stringify(p.name) + ", " + "formParams." + p.name + ");");
                        }
                    });

                    lines.push('');
                }

                lines.push(tab + tab + 'return {');

                lines.push(tab + tab + tab + 'method: ' + JSON.stringify(method.toUpperCase()) + ",");

                if (engine === "mobile") {
                    if (!usedUtils.includes("generateURIQuery")) {
                        usedUtils.push("generateURIQuery");
                    }
                    lines.push(tab + tab + tab + 'url: getApiUrl(' + preparePathString(path) + (queryParameters.length > 0 ? (" + generateURIQuery({ ...queryParams, _time: Date.now() })") : " + generateURIQuery({ _time: Date.now() })") + '),');
                } else {
                    lines.push(tab + tab + tab + 'url: getApiUrl(' + preparePathString(path) + (queryParameters.length > 0 ? (" + generateURIQuery(queryParams)") : "") + '),');
                }

                if (bodyParamType) {
                    lines.push(tab + tab + tab + 'json: body,');
                }

                if (formDataParameters.length > 0) {
                    if (engine === "browser" || engine === "mobile") {
                        lines.push(tab + tab + tab + 'form: formData,');
                    } else {
                        lines.push(tab + tab + tab + 'form: formData as any,');
                    }
                }

                if (headerParameters.length > 0) {
                    lines.push(tab + tab + tab + 'headers: headerParams as any,');
                }

                lines.push(tab + tab + tab + 'handleError: (err, handler) => {');

                lines.push(tab + tab + tab + tab + 'new RequestErrorHandler()');

                for (let c of errorCases) {
                    lines.push(tab + tab + tab + tab + tab + '.add(' + JSON.stringify(c.status) + ", " + JSON.stringify(c.code) + ", " + c.handleLogic + ')');
                }

                lines.push(tab + tab + tab + tab + tab + '.handle(err);');

                lines.push(tab + tab + tab + '},');

                lines.push(tab + tab + "};");


                lines.push(tab + '}');
            }
        }

        lines.push('}');

        lines.push('');

        if (linesExtraTypes.length > 0) {
            for (let l of linesExtraTypes) {
                lines.push(l);
            }
        }

        lines[4] = 'import { ' + usedLibraryImports.join(", ") + ' } from "' + requestLibrary + '";';
        lines[5] = 'import { ' + usedUtils.join(", ") + ' } from "./utils";';

        if (usedDefinitions.length > 0) {
            lines[6] = 'import { ' + usedDefinitions.join(", ") + ' } from "./definitions";';
        } else {
            lines.splice(6, 1);
        }

        if (usesFormData && engine === "node") {
            lines.splice(4, 0, 'import FormData from "form-data";');
        }

        if (usesFileParameter && engine === "node") {
            lines.splice(4, 0, 'import { Readable } from "stream";');
        }

        FS.writeFileSync(destFile, lines.join("\n") + "\n");
        console.log("Wrote api bindings file: " + destFile);
    }
}

function main() {
    // console.log(JSON.stringify(SwaggerDefinition));
    generateDefinitions(Path.resolve(__dirname, "..", "test", "mocha", "test-tools", "api-bindings", "definitions.ts"));
    generateAPIBindings(Path.resolve(__dirname, "..", "test", "mocha", "test-tools", "api-bindings"), "@asanrom/request-axios", "node");

    generateDefinitions(Path.resolve(__dirname, "..", "..", "frontend", "src", "api", "definitions.ts"));
    generateAPIBindings(Path.resolve(__dirname, "..", "..", "frontend", "src", "api"), "@asanrom/request-browser", "browser");

    generateDefinitions(Path.resolve(__dirname, "..", "..", "..", "mobile-application", "src", "api", "definitions.ts"));
    generateAPIBindings(Path.resolve(__dirname, "..", "..", "..", "mobile-application", "src", "api"), "@asanrom/request-browser", "mobile");
}

main();

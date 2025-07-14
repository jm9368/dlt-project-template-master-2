// This script scans the models files and
// generates database setup scripts

"use strict";

const Path = require("path");
const FS = require("fs");

function toSnakeCase(camel) {
    let result = "";
    for (let i = 0; i < camel.length; i++) {
        const c = camel.charAt(i);

        if (c.toLowerCase() !== c) {
            result += "_" + c.toLowerCase();
        } else {
            result += c;
        }
    }
    return result;
}

// Scans files recursively
function scanFiles(path) {
    const files = FS.readdirSync(path);
    const res = [];

    for (let file of files) {
        const absFile = Path.resolve(path, file);
        const stats = FS.lstatSync(absFile);

        if (stats.isDirectory()) {
            const subPathRes = scanFiles(absFile);

            for (let sf of subPathRes) {
                res.push(sf);
            }
        } else if (file.endsWith(".ts")) {
            res.push(absFile);
        }
    }

    return res;
}

// Parses model typescript file
function parseModelFile(file) {
    const fileContent = FS.readFileSync(file).toString();
    const lines = fileContent.split("\n");

    const result = {
        table: file.split("/").pop().split(".")[0].replace(/-/g, "_"),
        primaryKey: "",
        fields: [],
        indexes: [],
    };

    let currentField = {
        name: "",
        type: "",
        typeForced: false,
        typeLengthModifier: [],
        isPrimaryKey: false,
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.startsWith("const TABLE =")) {
            result.table = JSON.parse(line.split("=").slice(1).join("=").split(";")[0].replace(/'/g, "\""));
            continue;
        }

        if (line.startsWith("const PRIMARY_KEY =")) {
            result.primaryKey = JSON.parse(line.split("=").slice(1).join("=").split(";")[0].replace(/'/g, "\""));
            continue;
        }

        if (line.startsWith("/*") && line.endsWith("*/")) {
            // Information comment

            let cmdLine = line.substring(2, line.length - 2).trim();

            let cmd = cmdLine.split(":")[0].trim();
            let args = cmdLine.split(":").slice(1).join(":").split(",").map(a => {
                return a.trim().split(" ").map(b => b.trim());
            }).filter(a => !!a);

            switch (cmd) {
                case "db-ignore":
                    return result;
                case "db-table":
                    if (args.length !== 1 && args[0].length !== 1) {
                        throw new Error(`[Line ${i + 1}] db-table requires a single argument`);
                    }
                    result.table = args[0][0];
                    break;
                case 'db-primary-key':
                    currentField.isPrimaryKey = true;
                    break;
                case "db-type": {
                    if (args.length !== 1 && args[0].length < 1) {
                        throw new Error(`[Line ${i + 1}] db-type requires a single argument`);
                    }

                    const dbType = args[0][0].replace(/-/g, "").trim().toUpperCase();

                    if (["BOOLEAN", "DOUBLE", "FLOAT", "SMALLINT", "INT", "BIGINT", "DATE", "DATETIME", "TEXT", "MEDIUMTEXT", "LONGTEXT", "VARCHAR"].includes(dbType)) {
                        currentField.type = dbType;
                        currentField.typeForced = true;
                    } else {
                        throw new Error(`[Line ${i + 1}] db-type: Unsupported type: ${dbType}`);
                    }

                    for (let j = 1; j < args[0].length; j++) {
                        const modifier = parseInt(args[0][j], 10);

                        if (isNaN(modifier)) {
                            throw new Error(`[Line ${i + 1}] db-type: Invalid length modifier: ${args[0][j]}`);
                        }

                        currentField.typeLengthModifier.push(modifier);
                    }
                }

                    break;
                case "db-index":
                case "db-index-unique":
                    {
                        const indexData = {
                            unique: cmd === "db-index-unique",
                            fields: [],
                        };

                        for (let indexArg of args) {
                            const indexField = {
                                name: indexArg[0],
                                dir: "",
                            };

                            if (indexArg[1]) {
                                const dir = indexArg[1].toUpperCase();

                                if (["ASC", "DESC"].includes(dir)) {
                                    indexField.dir = dir;
                                } else {
                                    throw new Error(`[Line ${i + 1}] db-index: Invalid direction: ${dir} - Use ASC or DESC`);
                                }
                            }

                            indexData.fields.push(indexField);
                        }

                        result.indexes.push(indexData);
                    }
                    break;
            }

            continue;
        }

        if ((/^public\s[A-Za-z0-9]+:\s[A-Za-z0-9]+;$/).test(line)) {
            // Field
            const fieldName = line.split(":")[0].trim().split(" ").pop();

            currentField.name = fieldName;

            if (result.fields.length === 0 && !result.primaryKey) {
                currentField.isPrimaryKey = true;
            } else if (result.primaryKey && result.primaryKey === fieldName) {
                currentField.isPrimaryKey = true;
            }

            if (currentField.isPrimaryKey) {
                result.primaryKey = currentField.name;
            }

            if (!currentField.type) {
                const fieldType = line.split(":").slice(1).join(":").trim().split(";")[0].trim();

                switch (fieldType) {
                    case "boolean":
                        currentField.type = "BOOLEAN";
                        break;
                    case "number":
                        currentField.type = "DOUBLE";
                        break;
                    default:
                        currentField.type = "VARCHAR";
                        break;
                }
            }

            result.fields.push(currentField);

            currentField = {
                name: "",
                type: "",
                typeForced: false,
                typeLengthModifier: [],
                isPrimaryKey: false,
            };

            continue;
        }

        if ((/^this\.[A-Za-z0-9]+\s*=\s*enforceType\([A-Za-z0-9]+\.[A-Za-z0-9]+,\s*\"[A-Za-z0-9]+\"\)/).test(line)) {
            const fieldName = line.split(" ")[0].trim().split(".")[1];
            const fieldType = line.split("=").slice(1).join("=").split(",").slice(1).join(",").trim().split("\"")[1];

            let realFieldType = "VARCHAR";

            switch (fieldType) {
                case "int":
                    realFieldType = "BIGINT";
                    break;
                case "number":
                    realFieldType = "DOUBLE";
                    break;
                case "boolean":
                    realFieldType = "BOOLEAN";
                    break;
            }

            for (let field of result.fields) {
                if (field.name === fieldName && !field.typeForced) {
                    field.type = realFieldType;
                }
            }

            continue;
        }
    }

    return result;
}

function generateMongoScript(models) {
    const data = {
        primaryKeys: [],
        indexes: [],
    };

    for (let model of models) {
        if (!model.table) {
            continue;
        }
        if (model.primaryKey) {
            data.primaryKeys.push({
                collection: model.table,
                field: model.primaryKey,
            });
        }

        for (let i of model.indexes) {
            data.indexes.push({
                collection: model.table,
                unique: i.unique,
                fields: i.fields,
            });
        }
    }

    const mongoScript = Path.resolve(__dirname, "..", "database", "mongo.auto.json");

    FS.writeFileSync(mongoScript, JSON.stringify(data, null, 4));

    console.log(`Wrote MongoDB script: ${mongoScript}`);
}

function generateMySQLScript(models) {
    const lines = [];

    lines.push('-- MySQL setup script');
    lines.push('-- Run this script to set up the database schema and indexes');
    lines.push('-- Warning: This file is automatically generated, do not modify it.');

    lines.push("");

    for (let model of models) {
        lines.push('CREATE TABLE `' + model.table + '` (');

        let fieldCount = 0;

        for (let field of model.fields) {
            fieldCount++;

            lines.push('    ' +
                '`' + toSnakeCase(field.name) + '` ' +
                field.type +
                (field.typeLengthModifier.length > 0 ? ("(" + field.typeLengthModifier.join(", ") + ")") : "") +
                (field.typeLengthModifier.length === 0 && field.type === "VARCHAR" ? "(255)" : "") +
                (field.isPrimaryKey ? " PRIMARY KEY" : "") +
                (fieldCount >= model.fields.length ? "" : ",")
            );
        }

        lines.push(');');
        lines.push("");

        // Indexes

        if (model.indexes.length > 0) {
            for (let i = 0; i < model.indexes.length; i++) {
                const ix = model.indexes[i];
                const indexName = `ix_${model.table}_s_${i + 1}`;

                lines.push('CREATE ' + (ix.unique ? "UNIQUE " : "") + 'INDEX `' + indexName + '` ON `' + model.table + '`(' + ix.fields.map(f => {
                    return '`' + toSnakeCase(f.name) + '`' + (f.dir ? (" " + f.dir) : "");
                }).join(", ") + ');');
            }
            lines.push("");
        }
    }

    const sqlFile = Path.resolve(__dirname, "..", "database", "mysql.auto.sql");

    FS.writeFileSync(sqlFile, lines.join("\n"));

    console.log(`Wrote MySQL script: ${sqlFile}`);
}

function generatePostgresScript(models) {
    const lines = [];

    const TYPES_MAP = {
        "FLOAT": "REAL",
        "DOUBLE": "DOUBLE PRECISION",
    };

    lines.push('-- PostgreSQL setup script');
    lines.push('-- Run this script to set up the database schema and indexes');
    lines.push('-- Warning: This file is automatically generated, do not modify it.');

    lines.push("");

    for (let model of models) {
        lines.push('CREATE TABLE "' + model.table + '" (');

        let fieldCount = 0;

        for (let field of model.fields) {
            fieldCount++;

            const mappedType = TYPES_MAP[field.type] || field.type;

            lines.push('    ' +
                '"' + toSnakeCase(field.name) + '" ' +
                mappedType +
                (field.typeLengthModifier.length > 0 ? ("(" + field.typeLengthModifier.join(", ") + ")") : "") +
                (field.typeLengthModifier.length === 0 && mappedType === "VARCHAR" ? "(255)" : "") +
                (field.isPrimaryKey ? " PRIMARY KEY" : "") +
                (fieldCount >= model.fields.length ? "" : ",")
            );
        }

        lines.push(');');
        lines.push("");

        // Indexes

        if (model.indexes.length > 0) {
            for (let i = 0; i < model.indexes.length; i++) {
                const ix = model.indexes[i];
                const indexName = `ix_${model.table}_s_${i + 1}`;

                lines.push('CREATE ' + (ix.unique ? "UNIQUE " : "") + 'INDEX "' + indexName + '" ON "' + model.table + '"(' + ix.fields.map(f => {
                    return '"' + toSnakeCase(f.name) + '"' + (f.dir ? (" " + f.dir) : "");
                }).join(", ") + ');');
            }
            lines.push("");
        }
    }


    const sqlFile = Path.resolve(__dirname, "..", "database", "postgres.auto.sql");

    FS.writeFileSync(sqlFile, lines.join("\n"));

    console.log(`Wrote PostgreSQL script: ${sqlFile}`);
}

// Main
function main() {
    const basePath = Path.resolve(__dirname, "..", "src", "models");
    const modelFiles = scanFiles(basePath);

    console.log(`Found ${modelFiles.length} model source files.`);

    const models = [];

    for (let modelFile of modelFiles) {
        console.log(`Parsing model file: ${modelFile.substring(basePath.length + 1)}`);
        const model = parseModelFile(modelFile);

        // console.log(JSON.stringify(model));

        if (!model || !model.table) {
            continue;
        }

        models.push(model);
    }

    generateMongoScript(models);
    generateMySQLScript(models);
    generatePostgresScript(models);
}

main();

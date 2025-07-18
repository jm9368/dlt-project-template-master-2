// Translation file maker
// Search for uses of translation function and adds them to translation files

'use strict';

const FS = require("fs");
const Path = require("path");

function generateTranslationConfigurationFile(lang, resources) {
    const keys = Object.keys(resources).sort();
    const result = Object.create(null);

    for (const key of keys) {
        result[key] = resources[key] || key;
    }

    return JSON.stringify(result, null, 4)
}

function getResourcesFromTranslationsFile(file) {
    const locale = JSON.parse(FS.readFileSync(file).toString());
    return locale;
}

function searchTranslationUsages(file) {
    const str = FS.readFileSync(file).toString();

    const matches = (str.match(/__\(\"([^\\"]*)\"\)/gi) || []).concat((str.match(/__\(\'[^\\']*\'\)/gi) || []));
    const usages = {};

    for (const match of matches) {
        const tKey = JSON.parse('"' + match.substr(4, match.length - 6) + '"');

        usages[tKey] = "";
    }

    return usages;
}

function mergeResources(resource1, resource2) {
    const result = {};

    for (let key of Object.keys(resource1)) {
        result[key] = resource1[key];
    }

    for (let key of Object.keys(resource2)) {
        result[key] = resource2[key];
    }

    return result;
}

function mergeResourcesFirstSide(resource1, resource2) {
    const result = {};

    for (let key of Object.keys(resource1)) {
        result[key] = resource1[key] || resource2[key];
    }

    return result;
}

function findTranslationConfigFiles() {
    const files = FS.readdirSync(Path.resolve(__dirname, "..", "locales"));
    const result = [];
    for (let file of files) {
        if (file.endsWith(".json")) {
            result.push(Path.resolve(__dirname, "..", "locales", file));
        }
    }
    return result;
}

function scanDirectories(root) {
    const files = [];
    const filesInDir = FS.readdirSync(root);

    for (const file of filesInDir) {
        const absFile = Path.resolve(root, file);
        const relFile = absFile.substr(Path.resolve(__dirname, "..").length).substr(1);

        if (relFile === ".git") {
            continue;
        }

        const stats = FS.lstatSync(absFile);
        if (stats.isDirectory()) {
            const subFiles = scanDirectories(absFile);
            for (const sf of subFiles) {
                files.push(sf);
            }
        } else if (stats.isFile()) {
            if (file.endsWith(".ts") || file.endsWith(".js")) {
                files.push(absFile);
            }
        }
    }

    return files;
}

function main() {
    console.log("Generating language files...");

    const translationFiles = findTranslationConfigFiles();
    const scanned = scanDirectories(Path.resolve(__dirname, "..", "src"));

    // Scan directories looking for translation keys
    let usedKeys = {};

    for (const file of scanned) {
        const fileKeys = searchTranslationUsages(file);
        if (Object.keys(fileKeys).length > 0) {
            console.log("[REPORT] Found " + Object.keys(fileKeys).length + " translation keys in file " + file);
            // console.log("[KEYS-REPORT]" + JSON.stringify(Object.keys(fileKeys)));
            usedKeys = mergeResources(usedKeys, fileKeys);
        }
    }

    console.log("[REPORT] Total used keys found: " + Object.keys(usedKeys).length);

    // Regenerate translations files
    for (const file of translationFiles) {
        const keysFixed = mergeResourcesFirstSide(usedKeys, getResourcesFromTranslationsFile(file));

        const content = generateTranslationConfigurationFile(Path.basename(file), keysFixed);

        FS.writeFileSync(file, content);
    }
}

main();

import { getRootDir, reformatDocument } from './util';
import fs = require('fs');

import snakeCase = require('snake-case');
import { Uri } from 'vscode';

export async function generateApplicationModule(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);

    const applicationPath = `${rootDir}/modules/${nameSnake}/application`;
    const applicationFilePath = `${applicationPath}/${nameSnake}.go`;

    if (!fs.existsSync(applicationPath)) {
        fs.mkdirSync(applicationPath);
    }

    const applicationCode = `
package application

// TODO(*): code here
    `;

    fs.writeFileSync(applicationFilePath, applicationCode);

    var applicationFileUri = Uri.file(applicationFilePath);
    reformatDocument(applicationFileUri);

}
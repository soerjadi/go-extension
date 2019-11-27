import { window, ExtensionContext, commands } from 'vscode';

import { Cmd } from './cmd';
import { getRootDir, openAndFormatFile } from './util';
import { generateRepoCode, generateInterfacesCode } from './repository_code';

import fs = require('fs');
import pascalCase = require('pascal-case');
import snakeCase = require('snake-case');

export function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.model', async () => {
        const quickPick = window.createQuickPick();
        quickPick.items = [
            new Cmd("Create model", () => createModel())
        ];
        quickPick.onDidChangeSelection(selection => {
            if (selection[0]) {
                (selection[0] as Cmd).code_action(context)
                    .catch(console.error)
                    .then((result) => {
                        console.log(result);
                        quickPick.dispose();
                    });
            }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    }));
}

async function createModel() {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const name = await window.showInputBox({
        value: '',
        placeHolder: 'Model name, eg: User'
    }) || "";

    const namePascal = pascalCase(name);
    const nameSnake = snakeCase(name);

    const modelPath = `${rootDir}/models`;
    const modelDirPath = `${rootDir}/${nameSnake}`;
    const repositoryPath = `${modelDirPath}/repository`;
    const usecasePath = `${modelDirPath}/usecase`;

    const modelFilePath = `${modelPath}/${nameSnake}.go`;
    const repositoryFilePath = `${modelDirPath}/repository.go`;
    const usecaseFilePath = `${modelDirPath}/usecase.go`;

    let repositoryFileExists = false;
    let usecaseFilePathExists = false;

    if (!fs.existsSync(modelPath)) {
        window.showWarningMessage(`Path not exists: ${modelPath}`);
        return;
    }

    if (fs.existsSync(modelFilePath)) {
        window.showWarningMessage(`Model file already exists: ${nameSnake}.go`);
        return;
    }

    if (!fs.existsSync(repositoryPath)) {
        fs.mkdirSync(repositoryPath);
    }

    if (!fs.existsSync(usecasePath)) {
        fs.mkdirSync(usecasePath);
    }

    if (fs.existsSync(repositoryFilePath)) {
        repositoryFileExists = true;
    }

    if (fs.existsSync(usecaseFilePath)) {
        usecaseFilePathExists = true;
    }

    const modelCode = `
    package models

    // ${namePascal} model
    type ${namePascal} struct {
        // TODO(*): code here
    }
    `;

    fs.writeFileSync(modelFilePath, modelCode);

    if (!repositoryFileExists) {
        generateRepoCode(name, "", false);
    }

    // if (!interfacesFileExists) {
    //     generateInterfacesCode(name, false);
    // }

    openAndFormatFile(modelFilePath);

}
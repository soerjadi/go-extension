import { window, ExtensionContext, commands, Uri } from 'vscode';

import { Cmd } from './cmd';
import { getRootDir, openAndFormatFile, reformatDocument } from './util';

import fs = require('fs');
import pascalCase = require('pascal-case');
import snakeCase = require('snake-case');
import camelCase = require('camel-case');

export function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.usecase', async () => {
        const quickPick = window.createQuickPick();
        quickPick.items = [
            new Cmd("Generate usecase", () => generateUsecase()),
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

async function generateUsecase() {
    const name = await window.showInputBox({
        value: '',
        placeHolder: 'Usecasename name, eg: User'
    }) || "";

    if (name.length === 0) {
        window.showInformationMessage("No name");
        return;
    }

    const sourcePackage = await window.showInputBox({
        value: '',
        placeHolder: 'Source directory, eg: github.com/soerjadi/go-extension'
    }) || "";
}

export async function generateUsecaseCode(name: string, sourcePackage: string, openFile: boolean = true) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const namePascal = pascalCase(name);
    const nameCamel = camelCase(name);
    const nameSnake = snakeCase(name);

    const path = `${rootDir}/${nameSnake}/usecase`;
    const filePath = `${path}/${nameSnake}_usecase.go`;
    const fileTestPath = `${path}/${nameSnake}_usecase_test.go`;

    if (!fs.existsSync(path)) {
        window.showWarningMessage(`Path not exists: ${path}`);
        return;
    }

    if (fs.existsSync(filePath)) {
        window.showWarningMessage(`File already exists: ${filePath}`);
        return;
    }

    const code = `
    package usecase

    import (
        "context"
        "time"
    )

    type ${nameCamel}Usecase struct {
        repo ${nameSnake}.Repository
        timeout time.Duration
    }

    // New${namePascal}Usecase will create object that represent of ${nameSnake}.Usecase interface
    func New${namePascal}Usecase(r ${nameSnake}.Repository, timeout time.Duration) ${nameSnake}.Usecase {
        return &${nameCamel}Usecase{
            repo: r,
            timeout: timeout
        }
    }
    `;

    const testCode = `
    package usecase_test

    import "testing"

    func Test${namePascal}(t *testing.T) {
        t.Fatalf("fix me!")
    }
    `;

    fs.writeFileSync(filePath, code);
    fs.writeFileSync(fileTestPath, testCode);

    if (openFile) {
        openAndFormatFile(filePath);
    } else {
        var fileUri = Uri.file(filePath);
        reformatDocument(fileUri);
    }
}
import { window, ExtensionContext, commands, Uri } from 'vscode';

import { Cmd } from './cmd';
import { getRootDir, openAndFormatFile, insertLineInFile, reformatDocument } from './util';
import { generateRepoCode } from './repository_code';
import { generateTestCode } from './test';

import fs = require('fs');
import pascalCase = require('pascal-case');
import snakeCase = require('snake-case');
import camelCase = require('camel-case');

export function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.repository', async () => {
        const quickPick = window.createQuickPick();
        quickPick.items = [
            new Cmd("Generate repository", () => generateRepository()),
            new Cmd("Implement interface", () => generateImplementationRepo()),
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

async function generateRepository() {

    const name = await window.showInputBox({
        value: '',
        placeHolder: 'Repository name, eg: User'
    }) || "";

    if (name.length === 0) {
        window.showInformationMessage("No name");
        return;
    }

    const sourcePackage = await window.showInputBox({
        value: '',
        placeHolder: 'Source directory, eg: github.com/soerjadi/go-extension'
    }) || "";

    generateRepoCode(name, sourcePackage);

}

async function generateImplementationRepo() {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const name = await window.showInputBox({
        value: '',
        placeHolder: 'Repository name, eg: User'
    }) || "";

    if (name.length === 0) {
        window.showInformationMessage("No name");
        return;
    }

    const snakeName = snakeCase(name);
    const camelName = camelCase(name);

    const editor = window.activeTextEditor!;
    const text = editor.document.getText(editor.selection);

    editor.edit(builder => {
        const reName = new RegExp("type Repository interface {");
        const reFun = new RegExp("(\\w*)");

        let lines = text.split('\n');
        let newLines = [];

        for (let line of lines) {
            var s = reName.exec(line);
            if (s && s[0]) {
                continue;
            } else {
                s = reFun.exec(line.trim());
                if (s === null) {
                    continue;
                }

                if (s[1]) {
                    // get line as function
                    newLines.push("");
                    newLines.push(`// ${s[1]} description`);
                    newLines.push(`func (repo *${camelName}RepositoryImpl) ${line.trim()} {`);
                    newLines.push(`     panic("implement me")`);
                    newLines.push("}");
                }
                
            }

        }

        const interfaceCode = newLines.join('\n');

        const filePath = `${rootDir}/${snakeName}/repository/${snakeName}_repository.go`;

        if (!fs.existsSync(filePath)) {
            window.showWarningMessage(`Path file not exists: ${filePath}`);
            return;
        }

        fs.appendFileSync(filePath, interfaceCode);
        generateTestCode(name, text, 1);

        openAndFormatFile(filePath);
    });
}

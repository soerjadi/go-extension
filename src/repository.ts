import { window, ExtensionContext, commands } from 'vscode';

import { Cmd } from './cmd';
import { getRootDir, openAndFormatFile, insertLineInFile } from './util';
import { generateRepoCode, generateInterfacesCode } from './repository_code';

import fs = require('fs');
import pascalCase = require('pascal-case');
import snakeCase = require('snake-case');

export function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.repository', async () => {
        const quickPick = window.createQuickPick();
        quickPick.items = [
            new Cmd("Generate repository", () => generateRepository()),
            new Cmd("Generate interface", () => generateInterfaces()),
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

async function generateInterfaces() {
    const name = await window.showInputBox({
        value: '',
        placeHolder: 'Interfaces name, eq: User'
    }) || "";

    if (name.length === 0) {
        window.showInformationMessage("No name");
        return;
    }

    generateInterfacesCode(name);

}

async function generateImplementationRepo() {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const editor = window.activeTextEditor!;
    const text = editor.document.getText(editor.selection);

    editor.edit(builder => {
        const reName = new RegExp("type (\\w*) interface {");
        const reFun = new RegExp("(\\w*)");

        var name = "";

        let lines = text.split('\n');
        let newLines = [];

        for (let line of lines) {
            var s = reName.exec(line);
            if (s && s[1]) {
                if (name !== "") {
                    window.showWarningMessage("Name already defined: " + name);
                    return "";
                }

                name = s[1].trim();
                
            }
            if (name.length > 0) {
                s = reFun.exec(line);
                if (s === null) {
                    continue;
                }

                if (s[1]) {
                    // get line as function
                    newLines.push("");
                    newLines.push(`// ${s[1]} description`);
                    newLines.push(`func (repo *${pascalCase(name)}RepositoryImpl) ${line} {`);
                    newLines.push(`     panic("implement me")`);
                    newLines.push("}");
                }
                
            }

        }

        const interfaceCode = newLines.join('\n');

        const filePath = `${rootDir}/repository/${snakeCase(name)}.go`;

        if (!fs.existsSync(filePath)) {
            window.showWarningMessage(`Path file not exists: ${filePath}`);
            return;
        }

        insertLineInFile(filePath, "^var tableName =.*\"$", interfaceCode);
        // fs.appendFileSync(filePath, interfaceCode);

        openAndFormatFile(filePath);
    });
}

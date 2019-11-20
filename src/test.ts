import { window, ExtensionContext, commands } from 'vscode'; 

import { Cmd } from './cmd';
import { getRootDir, openAndFormatFile } from './util';

import fs = require('fs');
import snakeCase = require('snake-case');

export function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extention.test', async () => {
        const quickPick = window.createQuickPick();
        quickPick.items = [
            new Cmd("Test case from interfaces", () => generateTestFromImplementationRepo())
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

async function generateTestFromImplementationRepo() {
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

                name = s[1].trim() + "Test";
                continue;
            }
            if (name.length > 0) {
                s = reFun.exec(line.trim());
                if (s === null) {
                    continue;
                }

                if (s[1]) {
                    // get line as function
                    newLines.push("");
                    newLines.push(`// ${s[1]} description`);
                    newLines.push(`func Test${s[1]}(t *testing.T) {`);
                    newLines.push(`     t.Fatal("unimplemented")`);
                    newLines.push("}");
                }
            }

        }

        const packageCode = `
        package repository

        import "testing"

        `;

        const interfaceCode = packageCode + newLines.join('\n');

        const filePath = `${rootDir}/test/repository/${snakeCase(name)}.go`;

        if (fs.existsSync(filePath)) {
            window.showWarningMessage(`Path file already exists: ${filePath}`);
            return;
        }

        fs.writeFileSync(filePath, interfaceCode);

        openAndFormatFile(filePath);
    });
}
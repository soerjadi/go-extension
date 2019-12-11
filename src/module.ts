import { ExtensionContext, commands, window } from "vscode";

import { generateModel } from './model';

export async function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.module', async () => {
        const name = await window.showInputBox({
            value: '',
            placeHolder: 'Module name, eq: user'
        }) || "";

        if (name.length === 0) {
            window.showInformationMessage("No module name");
            return;
        }

        generateModel(name);
    }));
}


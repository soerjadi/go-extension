import { commands, ExtensionContext, window } from 'vscode';

import * as repository from './repository';
import * as usecase from './usecase';

export function activate(context: ExtensionContext) {

    context.subscriptions.push(commands.registerCommand('extension.repository', async () => {
        const name = await window.showInputBox({
            value: '',
            placeHolder: 'Repository name'
        }) || "";

        if (name.length == 0) {
            window.showInformationMessage("No repository name");
            return;
        }

        repository.generateRepositoryModule(name);

    }))

    context.subscriptions.push(commands.registerCommand('extension.usecase', async () => {
        const name = await window.showInputBox({
            value: '',
            placeHolder: 'Usecase name'
        }) || "";

        if (name.length == 0) {
            window.showInformationMessage("No Usecase name");
            return;
        }

        usecase.generateUsecaseModule(name);

    }))

}

// this method is called when your extension is deactivated
export function deactivate() {}
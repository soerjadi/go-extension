import { ExtensionContext, commands, window } from "vscode";

import { Cmd } from './cmd';
import { generateRepository, generateImplementationRepo } from './repository';
import { generateImplementationUsecase, generateUsecase } from './usecase';

export function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.core', async () => {
        const quickPick = window.createQuickPick();
        quickPick.items = [
            new Cmd("Generate Repository", () => generateRepository()),
            new Cmd("Generate Usecase", () => generateUsecase()),
            new Cmd("Implement Repository Interface", () => generateImplementationRepo()),
            new Cmd("Implement Usecase Interface", () => generateImplementationUsecase()),
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


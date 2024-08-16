import { commands, ExtensionContext, window } from 'vscode';

import * as delivery from './delivery';
import * as repository from './repository';
import * as usecase from './usecase';

export function activate(context: ExtensionContext) {

    delivery.setup(context);
    repository.setup(context);
    usecase.setup(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
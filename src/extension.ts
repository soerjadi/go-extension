import { ExtensionContext } from 'vscode';

import * as repository from './repository';
import * as model from './model';

export function activate(context: ExtensionContext) {

    repository.setup(context);
    model.setup(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
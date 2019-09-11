import { ExtensionContext } from 'vscode';

import * as repository from './repository';
import * as model from './model';
import * as test from './test';

export function activate(context: ExtensionContext) {

    repository.setup(context);
    model.setup(context);
    test.setup(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
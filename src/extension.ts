import { ExtensionContext } from 'vscode';

import * as pkg from './module';
import * as core from './core';
// import * as model from './model';
import * as test from './test';

export function activate(context: ExtensionContext) {

    pkg.setup(context);
    core.setup(context);
    // model.setup(context);
    test.setup(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
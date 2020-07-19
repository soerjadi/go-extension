import { ExtensionContext } from 'vscode';

import * as pkg from './module';

export function activate(context: ExtensionContext) {

    pkg.setup(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
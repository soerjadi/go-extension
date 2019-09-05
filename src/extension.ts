import { ExtensionContext } from 'vscode';

import * as repository from './repository';

export function activate(context: ExtensionContext) {

    repository.setup(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
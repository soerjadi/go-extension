import { ExtensionContext, commands, window } from "vscode";

import snakeCase = require('snake-case');
import { getRootDir } from "./util";
import fs = require('fs');
import { generateApplicationModule } from "./application";
import { generateDomainModule } from "./domain";
import { generatePersistanceRepositoryModule, generateRepositoryModule } from "./repository";

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

        // generate base module dir path
        generateBaseModuleDir(name);

        // TODO
        /**
         * Generate handler module
         */

         // generate application file
         generateApplicationModule(name);

         // generate domain + repository file 
         generateDomainModule(name);

         // generate insfrastructure + persistance module
         generateRepositoryModule(name);
         generatePersistanceRepositoryModule(name);
    }));
}

/**
 * Generate base module dir path for specific module name
 * @param name module name. from module name it will be 
 * converted to dir name/path
 */
async function generateBaseModuleDir(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        window.showWarningMessage("Root dir doesn't exists");
    }

    const nameSnake = snakeCase(name);

    const moduleDirPath = `${rootDir}/modules/${nameSnake}`;

    if (!fs.existsSync(moduleDirPath)) {
        fs.mkdirSync(moduleDirPath);
    }

}


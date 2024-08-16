import { commands, ExtensionContext, window } from 'vscode';
import { getRootDir, reformatDocument } from "./util";
import snakeCase = require("snake-case");
import fs = require('fs');
import camelCase = require("camel-case");

export async function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.delivery', async () => {
        const module = await window.showInputBox({
            value: '',
            placeHolder: 'Go Module. ex: github.com/soerjadi/shorty'
        }) || '';

        const name = await window.showInputBox({
            value: '',
            placeHolder: 'Rest module name'
        }) || '';


        if (module.length == 0) {
            window.showInformationMessage("No module name");
            return;
        }

        if (name.length == 0) {
            window.showInformationMessage("No repository name");
            return;
        }


        generateDeliveryRestModule(module, name);

    }))
}

async function generateDeliveryRestModule(module: string, name: string) {
	const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);

    const deliveryRestPath = `${rootDir}/internal/delivery/rest/${nameSnake}`;

    if (!fs.existsSync(deliveryRestPath)) {
        fs.mkdirSync(deliveryRestPath)
    }

    generateFunctionFile(name);
    generateInitFile(name, module);

}

async function generateFunctionFile(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);

    const functionFilePath = `${rootDir}/internal/delivery/rest/${nameSnake}/function.go`;
    const functionTestFilePath = `${rootDir}/internal/delivery/rest/${nameSnake}/function_test.go`;

    const functionCode = `package ${nameSnake}

import "net/http"

func (h *Handler) hello(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	return "hello world", nil
}
`;
    const functionTestCode = `package ${nameSnake}
`;

    fs.writeFileSync(functionFilePath, functionCode);
    fs.writeFileSync(functionTestFilePath, functionTestCode);
}

async function generateInitFile(name: string, module: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);

    const initFilePath = `${rootDir}/internal/delivery/rest/${nameSnake}/init.go`;
    const typeFilePath = `${rootDir}/internal/delivery/rest/${nameSnake}/type.go`;

    const initFileCode = `package ${nameSnake}

import (
	"net/http"

	"${module}/internal/delivery/rest"

	"github.com/gorilla/mux"
)

func NewHandler() rest.API {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/hello", rest.HandlerFunc(h.hello).Serve).Methods(http.MethodGet)
}
`;

    const typeFileCode = `package ${nameSnake}

type Handler struct {
}
`;

    fs.writeFileSync(initFilePath, initFileCode);
    fs.writeFileSync(typeFilePath, typeFileCode);
}
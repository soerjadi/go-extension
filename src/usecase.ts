import { getRootDir, reformatDocument } from "./util";
import pascalCase = require("pascal-case");
import snakeCase = require("snake-case");
import fs = require('fs');
import { ExtensionContext, commands, window } from "vscode";
import camelCase = require("camel-case");

export async function setup(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('extension.usecase', async () => {

        const name = await window.showInputBox({
            value: '',
            placeHolder: 'Repository name'
        }) || '';



        if (name.length == 0) {
            window.showInformationMessage("No repository name");
            return;
        }


        generateUsecaseModule(name);

    }))
}

async function generateUsecaseModule(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);

    const usecasePath = `${rootDir}/internal/usecase/${nameSnake}`;

    if (!fs.existsSync(usecasePath)) {
        fs.mkdirSync(usecasePath);
    }

    generateFunctionPath(name);
    generateInitPpath(name);
    generateTypePath(name);

}

async function generateFunctionPath(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);

    const functionFilePath = `${rootDir}/internal/usecase/${nameSnake}/function.go`;
    const functionTestFilePath = `${rootDir}/internal/usecase/${nameSnake}/function_test.go`;

    const functionCode = `package ${nameSnake}
`;

    fs.writeFileSync(functionFilePath, functionCode);
    fs.writeFileSync(functionTestFilePath, functionCode);
}

async function generateInitPpath(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    const nameCamel = camelCase(name);

    const initFilePath = `${rootDir}/internal/usecase/${nameSnake}/init.go`;
    const initTestFilePath = `${rootDir}/internal/usecase/${nameSnake}/init_test.go`;

    const initCode = `package ${nameSnake}    

func GetUsecase() Usecase {
    return &${nameCamel}Usecase{}
}
`;

    const initTestcode = `package ${nameSnake}    

import (
    "reflect"
    "testing"
)

func TestGetUsecase(t *testing.T) {
    type args struct {
	}
	tests := []struct {
		name string
		args args
		want Usecase
	}{
		{
			name: "soerja",
			want: &${nameCamel}Usecase{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := GetUsecase(); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("GetUsecase() = %v, want %v", got, tt.want)
			}
		})
	}
}
`;

    fs.writeFileSync(initFilePath, initCode);
    fs.writeFileSync(initTestFilePath, initTestcode);
}

async function generateTypePath(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    const nameCamel = camelCase(name);
    const namePascal = pascalCase(name);

    const typeFilePath = `${rootDir}/internal/usecase/${nameSnake}/type.go`;

    const typeCode = `package ${nameSnake}   

//go:generate mockgen -package=mocks -mock_names=Usecase=Mock${namePascal}Usecase -destination=../../mocks/${nameSnake}_usecase_mock.go -source=type.go
type Usecase interface {
}

type ${nameCamel}Usecase struct {
}
`;

    fs.writeFileSync(typeFilePath, typeCode);
}

import { window, Uri } from 'vscode';

import { getRootDir, openAndFormatFile, reformatDocument } from './util';

import fs = require('fs');
import pascalCase = require('pascal-case');
import snakeCase = require('snake-case');
import camelCase = require('camel-case');

export async function generateInterfacesCode(name: string, openFile: boolean = true) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const namePascal = pascalCase(name);
    const path = `${rootDir}/interfaces`;
    const filePath = `${path}/${snakeCase(name)}_interface.go`;

    if (!fs.existsSync(path)) {
        window.showWarningMessage(`Path not exists: ${path}`);
        return;
    }

    if (fs.existsSync(filePath)) {
        window.showWarningMessage(`File already exists: ${filePath}`);
        return;
    }

    const code = `
    package interfaces

    // ${namePascal} interface
    type ${namePascal} interface {
        // TODO(*): code here
    }
    `;

    fs.writeFileSync(filePath, code);

    if (openFile) {
        openAndFormatFile(filePath);
    } else {
        var fileUri = Uri.file(filePath);
        reformatDocument(fileUri);
    }
}

export async function generateRepoCode(name: string, sourcePackage: string, openFile: boolean = true) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const namePascal = pascalCase(name);
    const nameCamel = camelCase(name);
    const nameSnake = snakeCase(name);

    const path = `${rootDir}/${nameSnake}/repository`;
    const filePath = `${path}/${nameSnake}_repository.go`;
    const fileTestPath = `${path}/${nameSnake}_repository_test.go`;

    if (!fs.existsSync(path)) {
        window.showWarningMessage(`Path not exists: ${path}`);
        return;
    }

    if (fs.existsSync(filePath)) {
        window.showWarningMessage(`File already exists: ${filePath}`);
        return;
    }

    let importCode = `import "database/sql"`;
    if (sourcePackage.length > 0) {
        importCode = `import (
            "database/sql"
            "context"
        )
        `;
    }

    const repoCode = `
    package repository

    ${importCode}

    // ${nameCamel}RepositoryImpl struct implementation ${name.toLowerCase()} repository
    type ${nameCamel}RepositoryImpl struct {
        Conn *sql.DB
    }

    // ${namePascal}RepositoryWithRDB Data Access for ${namePascal}
    func New${namePascal}Repository(conn *sql.DB) ${nameSnake}.Repository {
        return &${namePascal}RepositoryImpl{Conn: conn}
    }

    var ${nameCamel}Table = "table_name"

    func (repo *${namePascal}RepositoryImpl) fetch(ctx context.Context, query string, args ...interface{}) ([]*models.${namePascal}, error) {
        rows, err := p.Conn.QueryContext(ctx, query, args...)
        if err != nil {
            return nil, err
        }
    
        defer func() {
            err := rows.Close()
            if err != nil {
                // TODO(*): add logger here
            }
        }()
    
        result := make([]*models.${namePascal}, 0)
        for rows.Next() {
            t := new(models.${namePascal})

            // TODO(*): implement scanner here

            result = append(result, t)
        }

        return result, nil
    }
    `;

    const repoTestCode = `
    package repository_test

    import "testing"

    func Test${namePascal}(t *testing.T) {
        t.Fatalf("fix me!")
    }
    `;

    fs.writeFileSync(filePath, repoCode);
    fs.writeFileSync(fileTestPath, repoTestCode);

    if (openFile) {
        openAndFormatFile(filePath);
    } else {
        var fileUri = Uri.file(filePath);
        reformatDocument(fileUri);
    }

}
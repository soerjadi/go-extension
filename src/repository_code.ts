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
    const filePath = `${path}/${snakeCase(name)}.go`;

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
    const path = `${rootDir}/repository`;
    const filePath = `${rootDir}/repository/${snakeCase(name)}.go`;

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

            "${sourcePackage}/interfaces"
        )
        `;
    }

    const repoCode = `
    package repository

    ${importCode}

    // ${namePascal}RepositoryImpl struct implementation ${name.toLowerCase()} repository
    type ${namePascal}RepositoryImpl struct {
        Conn *sql.DB
    }

    // ${namePascal}RepositoryWithRDB Data Access for ${namePascal}
    func ${namePascal}RepositoryWithRDB(conn *sql.DB) interfaces.${namePascal} {
        return &${namePascal}RepositoryImpl{Conn: conn}
    }

    var ${camelCase("name")}Name = "table_name"

    func (repo *AccessTokenImpl) execQuery(q string, args ...interface{}) error {
        stmt, err := repo.Conn.Prepare(q)
    
        if err != nil {
            return err
        }
    
        defer stmt.Close()
    
        _, err = stmt.Exec(args...)
    
        return err
    }

    func (repo *${namePascal}RepositoryImpl) query(q string, args ...interface{}) (*sql.Rows, error) {
        stmt, err := repo.Conn.Prepare(q)

        if err != nil {
            return nil, err
        }

        defer stmt.Close()

        return stmt.Query(args...)
    }

    func (repo *${namePascal}RepositoryImpl) queryRow(q string, args ...interface{}) (*sql.Row, error) {
        stmt, err := repo.Conn.Prepare(q)

        if err != nil {
            return nil, err
        }

        defer stmt.Close()

        return stmt.QueryRow(args...), nil
    }
    `;

    fs.writeFileSync(filePath, repoCode);

    if (openFile) {
        openAndFormatFile(filePath);
    } else {
        var fileUri = Uri.file(filePath);
        reformatDocument(fileUri);
    }

}
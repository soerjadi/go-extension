
import fs = require('fs');
import { getRootDir, reformatDocument } from './util';
import snakeCase = require('snake-case');
import pascalCase = require('pascal-case');
import { Uri } from 'vscode';
import { generateRepositoryModule } from './repository';

export async function generateDomainModule(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    const namePascal = pascalCase(name);

    const domainPath = `${rootDir}/modules/${nameSnake}/domain`;
    const domainFilePath = `${domainPath}/${nameSnake}.go`;

    if (!fs.existsSync(domainPath)) {
        fs.mkdirSync(domainPath)
    }

    const domainModuleCode = `
package domain

// ${namePascal} entity
type ${namePascal} struct {
    ID  int64
}
    `;

    fs.writeFileSync(domainFilePath, domainModuleCode);

    var domainFileUri = Uri.file(domainFilePath);
    reformatDocument(domainFileUri);

    // because repository layer instead domain layer
    // so generate repository will be down here
    generateRepositoryModule(name);
}

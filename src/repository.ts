import { getRootDir, reformatDocument } from "./util";
import pascalCase = require("pascal-case");
import snakeCase = require("snake-case");
import fs = require('fs');
import { Uri } from "vscode";
import camelCase = require("camel-case");

export async function generateRepositoryModule(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    const namePascal = pascalCase(name);

    const repositoryPath = `${rootDir}/modules/${nameSnake}/domain/repository`;
    const repositoryFilePath = `${repositoryPath}/${nameSnake}.go`;

    if (!fs.existsSync(repositoryPath)) {
        fs.mkdirSync(repositoryPath);
    }

    const repositoryCode = `
package repository

import "../../domain"

// ${namePascal}Repository service layer
type ${namePascal}Repository interface {
    GetByID(id int64) (*domain.${namePascal}, error)
}
    `;

    fs.writeFileSync(repositoryFilePath, repositoryCode);

    var repositoryFileUri = Uri.file(repositoryFilePath);
    reformatDocument(repositoryFileUri);
}

export async function generatePersistanceRepositoryModule(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    const namePascal = pascalCase(name);
    const nameRepository = pascalCase(name + " repository");

    const infraStrcPath = `${rootDir}/modules/${nameSnake}/infrasturcuture`;
    const repositoryPath = `${infraStrcPath}/persistance`;
    const repositoryFilePath = `${repositoryPath}/${snakeCase(name)}_repository.go`;
    const repositoryTestFilePath = `${repositoryPath}/${snakeCase(name)}_repository_test.go`;
    
    if (!fs.existsSync(infraStrcPath)) {
        fs.mkdirSync(infraStrcPath);
    }

    if (!fs.existsSync(repositoryPath)) {
        fs.mkdirSync(repositoryPath);
    }

    const repositoryCode = `
package persistance

import (
    cfg "../../../../systems/config"
    "../../domain"
    "../../domain/repository"
);

// ${nameRepository}Impl --
type ${nameRepository}Impl struct {
    DB *gorm.DB
} 

// New${nameRepository}WithRDB --
func New${nameRepository}WithRDB() repository.${nameRepository} {
    db := cfg.Config.DB
    return &${nameRepository}Impl{
        DB: db,
    }
}

func (r *${nameRepository}Impl) GetByID(id int64) (*domain.${namePascal}, error) {
    return nil, nil
}
    `;

    const repositoryTestCode = `
package persistance_test

import (
    "github.com/DATA-DOG/go-sqlmock"
    "github.com/jinzhu/gorm"
    "github.com/stretchr/testify/require"
    "github.com/stretchr/testify/suite"
    "github.com/stretchr/testify/assert"

    "testing"
    "database/sql"
);

type ${nameRepository}Suite struct {
    suite.Suite
    DB *gorm.DB
    mock sqlmock.Sqlmock
    repository *${nameRepository}Impl
}

func (suite *${nameRepository}Suite) SetupTest() {
    var (
        db  *sql.DB
        err error
    )

    db, suite.mock, err = sqlmock.New()

    require.NoError(suite.T(), err)

    suite.DB, err = gorm.Open("postgres", db)

    require.NoError(suite.T(), err)

    suite.DB.LogMode(true)
    suite.repository = &${nameRepository}Impl{DB: suite.DB}
}

func (suite *${nameRepository}Suite) AfterTest(_, _ string) {
    require.NoError(suite.T(), suite.mock.ExpectationsWereMet())
}

func TestInit(t *testing.T) {
    suite.Run(t, new(${nameRepository}Suite))
}

func (suite *${nameRepository}) TestGetByID() {
    assert.Fail(t, "Implement me!")
}
    `;

    fs.writeFileSync(repositoryFilePath, repositoryCode);
    fs.writeFileSync(repositoryTestFilePath, repositoryTestCode);

    var repositoryFileUri = Uri.file(repositoryFilePath);
    var repositoryTestFileUri = Uri.file(repositoryTestFilePath);
    reformatDocument(repositoryFileUri);
    reformatDocument(repositoryTestFileUri);
}
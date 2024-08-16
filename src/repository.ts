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

    const repositoryPath = `${rootDir}/internal/repository/${nameSnake}`;
    if (!fs.existsSync(repositoryPath)) {
        fs.mkdirSync(repositoryPath)
    }

    generateQueryRepositry(name);
    generateInitPath(name);
    generateRepositoryPath(name);
    generateTypePath(name);

}

async function generateQueryRepositry(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    
    const constFilePath = `${rootDir}/internal/repository/${nameSnake}/const_query.go`;
    const queryFilePath = `${rootDir}/internal/repository/${nameSnake}/query.go`;

    const constFileCode = `
package ${nameSnake}

type prepareQuery struct{
}
    `;
    
    
    const queryFileCode = `
package ${nameSnake}
    `;
    
    fs.writeFileSync(constFilePath, constFileCode);
    fs.writeFileSync(queryFilePath, queryFileCode);

}

async function generateRepositoryPath(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);

    const repositoryPath = `${rootDir}/internal/repository/${nameSnake}/repository.go`;
    const repositoryTestPath = `${rootDir}/internal/repository/${nameSnake}/repository_test.go`;

    const repositoryCode = `
package ${nameSnake}
    `;

    const repositoryTestCode = `
package ${nameSnake}
    `;

    fs.writeFileSync(repositoryPath, repositoryCode);
    fs.writeFileSync(repositoryTestPath, repositoryTestCode);
}

async function generateInitPath(name: string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    const nameCamelCase = camelCase(name);

    const initPath = `${rootDir}/internal/repository/${nameSnake}/init.go`;
    const initTestPath = `${rootDir}/internal/repository/${nameSnake}/init_test.go`;

    const initCode = `
package ${nameSnake}

import "github.com/jmoiron/sqlx"

func prepareQueries(db *sqlx.DB) (prepareQuery, error) {
    var (
        q prepareQuery
    )

    return q, nil
}

func GetRepository(db *sqlx.DB) (Repository, error) {
	query, err := prepareQueries(db)
	if err != nil {
		return nil, err
	}

	return &${nameCamelCase}Repository{
		query: query,
	}, nil
}

    `;

    const initTestCode = `
package ${nameSnake}  

import (
    "database/sql"
    "reflect"
    "testing"

    "github.com/DATA-DOG/go-sqlmock"
    "github.com/jmoiron/sqlx"
)

type prepareQueryMock struct {
}

func expectPrepareMock(mock sqlmock.Sqlmock) prepareQueryMock {
    prepareQuery := prepareQueryMock{}

    return prepareQuery
}

func TestGetRepository(t *testing.T) {

	tests := []struct {
		name     string
		initMock func() (*sqlx.DB, *sql.DB, sqlmock.Sqlmock)
		want     func(db *sqlx.DB) Repository
		wantErr  bool
	}{
		{
			name: "success",
			initMock: func() (*sqlx.DB, *sql.DB, sqlmock.Sqlmock) {
				db, mock, _ := sqlmock.New()
				expectPrepareMock(mock)
				expectPrepareMock(mock)
				return sqlx.NewDb(db, "postgres"), db, mock
			},
			want: func(db *sqlx.DB) Repository {
				q, _ := prepareQueries(db)

				return &${nameCamelCase}Repository{
					query: q,
				}
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, dbMock, mock := tt.initMock()
			defer dbMock.Close()

			got, err := GetRepository(db)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetRepository() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			want := tt.want(db)
			if !reflect.DeepEqual(got, want) {
				t.Errorf("GetRepository() = %v, want %v", got, want)
			}
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err.Error())
			}
		})
	}
}
    `;

    fs.writeFileSync(initPath, initCode);
    fs.writeFileSync(initTestPath, initTestCode);

}

async function generateTypePath(name:string) {
    const rootDir = getRootDir();

    if (!rootDir) {
        return;
    }

    const nameSnake = snakeCase(name);
    const namePascal = pascalCase(name);
    const nameCamel = camelCase(name);

    const typeRepositoryPath = `${rootDir}/internal/repository/${nameSnake}/type.go`;

    const typeRepositoryCode = `
package ${nameSnake}

//go:generate mockgen -package=mocks -mock_names=Repository=Mock${namePascal}Repository -destination=../../mocks/${nameSnake}_repo_mock.go -source=type.go
type Repository interface{
}

type ${nameCamel}Repository struct {
    query prepareQuery
}
    `;

    fs.writeFileSync(typeRepositoryPath, typeRepositoryCode);
}

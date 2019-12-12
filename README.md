# GO VSCode

This extension will help you simplify coding in go, this is based on [Go Clean Architecture](https://github.com/bxcodec/go-clean-arch)

## Feature

### Generate Core
* Generate Repository
* Generate Usecase
* Implement repository based on interfaces
* Implement usecase based on usecase

### Generate Module
### Generate test case
### GoLang Snippet
|Prefix|Method|
|------:|-----:|
|`fs`|`fmt.Sprintf("$1")`|
|`mux-params`|`params := r.URL.Query()`|
|`mux-route`|`.Methods("GET")`|
|`mux-postroute`|`.Methods("POST")`|
#### `mockinit`
```go
db, mock, err := sqlmock.New()
if err != nil {
    t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
}
```
#### `ctxusecase`
```go
ctx, cancel := context.WithTimeout(ctx, $1)
defer cancel()
```
#### `initctx`
```go
ctx := ${1:r.Context()}
if ctx == nil {
    ctx = context.Background()
}
```
#### `funcstep`
```go
t.Run("$1", func(t *testing.T) {
    $2
})
```
#### `mux-posthandler`
```go
// $2 $5
func ($1) $2(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    ctx := r.Context()
    if ctx == nil {
        ctx = context.Background()
    }
    
    var ${3:structPost} $4
    body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        $5
    }

    err = json.Unmarshal(body, &$3)
    if err != nil {
        $6
    }
}
```
#### `mux-handler`
```go
// $2 $5
func ($1) $2(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    if ctx == nil {
        ctx = context.Background()
    }
}
```
#### `mux-offlimit`
```go
o := params.Get("offset")
l := params.Get("limit")

if o == "" {
	o = "0"
}
if l == "" {
	l = "10"
}

offset, err := strconv.ParseInt(o, 10, 64)
if err != nil {
	$1
}

limit, err := strconv.ParseInt(l, 10, 64)
if err != nil {
	$2
}

```
#### `mux-id`
```go
id, err := strconv.ParseInt(params.Get("id"), 0, 64)

if err != nil {
	$1
}
```
#### `mux-routehandler`
```go
// ${1:Handler} represent the http handler for $4
type $1 struct {
	${2:Usecase} $3
}

// New$1 initialize $4 resource endpoint
func New$1(router *mux.Router, usecase $3) *mux.Router {
	handler := &$1{
		$2: usecase,
	}

	h := router.PathPrefix("").Subrouter()

	return h
}
```




## Build

Enter into root project directory, and type:

    $ vsce package

The above command will created vsix file, eg: go-vscode-0.1.2.vsix
Now you can install into VS Code > Extension > Install from VSIX.

**Enjoy!**

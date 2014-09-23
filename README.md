# anyfs

AnyFS is an abstraction of local or remote file systems.

## Basic API

### `constructor(options)`

### `metadata(path, callback)`

### `mkdir(path, callback)`

### `rmdir(path, callback)`

### `rename(oldPath, newPath, callback)`

### `writeFile(path, options, callback)`

### `readFile(path, options, callback)`

### `createWriteStream(path, options)`

### `createReadStream(path, options)`

## Advanced API

### `glob(pattern, callback)`

### `src(pattern, options)`

### `dest(path)`

## API Implemented by Sub Class

### `_metadata(path, callback)`

### `_mkdir(path, callback)`

### `_rmdir(path, callback)`

### `_rename(oldPath, newPath, callback)`

### `_writeFile(path, options, callback)`

### `_readFile(path, options, callback)`

### `_createWriteStream(path, options)`

### `_createReadStream(path, options)`

## Tests

AnyFS implements should pass the tests under `anyfs/test.js`

```js
var MyFS = require('MyFS');
var fs = new MyFS();
var test = require('anyfs/test');
test(fs);
```
# anyfs

AnyFS is an abstraction of local or remote file systems.

## Concepts

File and directory should have as few properties as possible. For example, permission, owner, atime are not necessarily to be concerned.

API should support callback as well as promise.

The abstract package defines interfaces and impletions implement them seperately to achieve an consistent and easy to test system.

## Basic API

### `constructor(options)`

The constructor accepts only an options object. Some common options are shared between all adapters.

- base: Base path of the file system.

### `metadata(path, options, callback)`

Retrieves file and folder metadata.

If the `list` option set to true, the folder's metadata will include a contents field with a list of metadata entries for the contents of the folder.

Folder metadata:

```js
{
    "modified": "Mon, 07 Apr 2014 23:13:16 +0000",
    "is_dir": true,
    "contents": [ 
        ...
    ],
    "extra": {}
}
```

File metadata:

```js
{
    "modified": "Mon, 07 Apr 2014 23:13:16 +0000",
    "is_dir": false,
    "bytes": 123,
    "extra": {}
}
```

The `modified`, `bytes` and `extra` are optional.

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

## Error Codes

ELOGIC: Action not taken because it might break file system logic.

ESYSTEM: Action not taken due to system problems.

## Tests

AnyFS implements should pass the tests under `anyfs/test.js`

```js
var MyFS = require('MyFS');
var fs = new MyFS();
var test = require('anyfs/test');
test(fs);
```
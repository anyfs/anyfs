# anyfs

AnyFS is a portable file system solution.

Note: AnyFS is under heavy development, it's not usable yet. Any contributions 
are welcome!

## Features

- Super portable
- Works well with Gulp

## Adapters

This package comes with following adapters.

- Memory: in memory file system
- Local: local file system
- Dropbox
- FTP

## Usage

```js
var FTPFS = require('anyfs.ftp');
var Dropboxfs = require('anyfs.dropbox');
var fs1 = new FTPFS({
    server: 'ftp.example.com',
    username: 'user',
    password: 'password',
});

var fs2 = new DropboxFS({
    // ...
});

fs1.src('/**/*.jpg')
    .pipe(fs2.dest('/backup/abc/'));
```

## API

### Basic API

Following APIs are basic file system APIs.

#### `constructor(options)`

The constructor accepts only an options object. Some common options are shared 
between all adapters.

- cwd: Current working directory.

#### `metadata(path[, options][, callback])`

Retrieves file and folder metadata.

If the `list` option set to true, the folder's metadata will include a contents 
field with a list of metadata entries for the contents of the folder.

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

If path does not exist, a null result is provided.

#### `mkdir(path[, callback])`

Create directory recursively.

#### `delete(path[, callback])`

Delete file or directory (recursively).

#### `move(oldPath, newPath[, callback])`

Move file or directory to a new place.

#### `writeFile(path, content[, options][, callback])`

Write file content, will try to create parent directory.

#### `readFile(path[, options][, callback])`

Read file content.

#### `createWriteStream(path[, options])`

Create write stream.

#### `createReadStream(path[, options])`

Create read stream.

### Advanced API

Some advanced APIs.

#### `glob(pattern, callback)`

Match files using the given patterns. See [glob](https://github.com/isaacs/node-glob).  

#### `src(pattern[, options])`

#### `dest(path)`
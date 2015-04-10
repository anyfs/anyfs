# anyfs

AnyFS is a portable file system solution.

## Features

- Super portable
- Works well with Gulp

## Drivers

This package comes with following drivers.

- [Memory](https://github.com/anyfs/memory): in memory file system
- [FTP](https://github.com/anyfs/ftp)
- <del>[Local](https://github.com/anyfs/local): local file system</del>
- <del>[Dropbox](https://github.com/anyfs/dropbox)</del>
- <del>AWS S3</del>

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

#### `metadata(path[, options][, callback(error, metadata)])`

Retrieves file and folder metadata.

If the `list` option set to true, the folder's metadata will include a contents 
field with a list of metadata entries for the contents of the folder.

Folder metadata:

```js
{
    "name": "dir1",
    "time": 1428648792000,
    "is_dir": true,
    "children": [ 
        ...
    ],
    ...
}
```

File metadata:

```js
{
    "name": "file1.txt",
    "time": 1428648792,
    "is_dir": false,
    "size": 123,
    ...
}
```

Both `time` and `size` are optional. If callback is not provided, a promise is returned.


#### `mkdir(path[, callback(error)])`

Create directory recursively.

If callback is not provided, a promise is returned.

#### `delete(path[, callback(error)])`

Delete file or directory (recursively).

If callback is not provided, a promise is returned.

#### `move(oldPath, newPath[, callback(error)])`

Move file or directory to a new place.

If parent folder of `newPath` is created automaticly.

If callback is not provided, a promise is returned.

#### `writeFile(path, content[, options][, callback(error)])`

Write file content, will try to create parent directory.

If callback is not provided, a promise is returned.

#### `readFile(path[, options][, callback(error, data)])`

Read file content.

If callback is not provided, a promise is returned.

#### `createWriteStream(path[, options])`

Create write stream.

#### `createReadStream(path[, options])`

Create read stream.

### Advanced API

Some advanced APIs.

#### `glob(pattern[, callback(err, files)])`

Match files using the given patterns. See [glob](https://github.com/isaacs/node-glob).

If callback is not provided, a glob stream is returned.

#### `src(pattern[, options])`

See [vinyl-fs](https://github.com/wearefractal/vinyl-fs).

#### `dest(path)`

See [vinyl-fs](https://github.com/wearefractal/vinyl-fs).

## Create Custom Driver

See the [abstract driver](https://github.com/anyfs/abstract)

## TODO

- `watch` API
- More drivers
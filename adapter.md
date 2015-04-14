# AnyFS Adapter Specification

## APIs

API callback takes two params: error and return data.

### `metadata(path, callback)`

Get metadata of path.

Return:

- name(String)
- is_dir(Boolean): is it a directory or not
- time(Date): time of last modification
- size(Int): file only, size of file in bytes
- ...: any adapter specific file infomation

Errors:

- ENOENT

### `list(path, callback)`

Return: array of metadata files 

```json
[
    {
        // see metadata
    }
]
```

Errors:

- ENOENT: directory does not exist
- ENOTDIR: path is not a directory

### `move(source, target, callback)`

Features:

- MOVE_MKDIR: parent directory is created automatically.

Errors:

- ENOENT: source or target???
- EEXIST: target already exist

### `mkdir(path, callback)`

Features:

- MKDIR_PASS_EXIST: existing directory will not cause an error
- MKDIR_RECURSIVE: recursive creation of parent folders is operated automaticly

Errors:

- EEXIST: file or directory already exist
- ENOENT: parent directory does not exist

### `delete(path, callback)`

Features:

- DELETE_RECURSIVE

Errors:

- ENOENT: file or directory does not exist
- EEXIST: directory not empty

### `writeFile(path, data, callback)`

Implement at least one of `writeFile` and `createWriteStream`.

Note data should be Buffer type only.

Features:

- WRITE_MKDIR: parent directory is created automatically.

Errors:

- ENOENT: Parent does not exist
- EISDIR: Path is a directory

### `readFile(path, callback)`

Implement at least one of `readFile` and `createReadStream`.

Note returned data should be Buffer type only.

Errors:

- ENOENT: File not exist
- EISDIR: Path is a directory

### `createWriteStream(path, callback)`

Implement at least one of `writeFile` and `createWriteStream`.

Features:

- WRITE_MKDIR: parent directory is created automatically.

Errors:

- ENOENT: Parent does not exist
- EISDIR: path is a directory

### `createReadStream(path, callback)`

Implement at least one of `readFile` and `createReadStream`.

Errors:

- ENOENT: Parent does not exist
- EISDIR: path is a directory

## Generic Errors

- ENOENT: file or directory does not exist
- EEXIST: file or directory already exist
- ENOTDIR: not a directory
- EISDIR: is a directory
- EACCES: permission denied
- ELOGIC: operation not allowed, because it might break logic of the file system.
- ESYSTEM: system errors.

## Adapter Features

- MKDIR_PASS_EXIST: existing directory will not cause an error
- MKDIR_RECURSIVE: recursive creation of parent folders is operated automaticly

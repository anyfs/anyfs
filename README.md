# anyfs

AnyFS is an abstraction of local or remote file systems.

## Concepts

File and directory should have as few properties as possible. For example, permission, owner, atime are not necessarily to be concerned.

API should support callback as well as promise.

The abstract package defines interfaces and impletions implement them seperately to achieve an consistent and easy to test system.


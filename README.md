# Version Storage

### Introduction

`v-storage` is a storage lib which support simple version control base on the package [good-storage](https://github.com/ustbhuangyi/storage). 

### Install

```
# npm
npm i v-storage

# yarn
yarn add v-storage
```

### Usage

**It just simply suffix the key with the version parameter. When the version parameter is not the same with localStorage.version, it will clear localStorage and init.**

```
const version = 'v1'
const guarded = [
  'version',
  'guarded',
  'guard1',
  'guard2',
  'guard3',
  'guard4',
]
window.vStorage = new VersionStorage(version, guarded)
vStorage.set('key', 'value')
```

### API
Almost the same as [good-storage](https://github.com/ustbhuangyi/storage).
Or read the source code directly.

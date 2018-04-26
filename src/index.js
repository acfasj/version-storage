import storage from './storage/storage'
import { suffix, unique } from './utils/utils'

const GUARDED = 'guarded'
const VERSION = 'version'
const defaultGuarded = [GUARDED, VERSION]

export default function VersionStorage(version, guarded) {
  if (!version) {
    console.error('Constructor VersionStorage require a version at arguments[0]')
    return
  }
  this.version = version
  if (guarded && Array.isArray(guarded)) {
    guarded = unique(guarded.concat(defaultGuarded))
  } else {
    guarded = defaultGuarded
  }
  this.guarded = guarded
  this._init()
}

VersionStorage.prototype.set = function (key, val, nosuffix = false) {
  if (!nosuffix) {
    const realKey = this._getKey(key)
    return storage.set(realKey, val)
  }
  let guarded = storage.get(GUARDED)
  guarded = unique(guarded.concat(key))
  storage.set(GUARDED, guarded)
  this.guarded = guarded
  return storage.set(key, val)
}

VersionStorage.prototype.setDirect = function (key, val) {
  return this.set(key, val, true)
}

VersionStorage.prototype.get = function (key, def) {
  const realKey = this._getKey(key)
  return storage.get(realKey, def)
}

VersionStorage.prototype.has = function (key) {
  const realKey = this._getKey(key)
  return storage.has(realKey)
}

VersionStorage.prototype.remove = function (key) {
  const realKey = this._getKey(key)
  return storage.remove(realKey)
}

VersionStorage.prototype.clear = function () {
  return storage.clear()
}

VersionStorage.prototype.getAll = function () {
  return storage.getAll()
}

VersionStorage.prototype.forEach = function (callback) {
  return storage.forEach(callback)
}

VersionStorage.prototype._getKey = function (key) {
  if (this._isGuarded(key)) {
    return key
  }
  return suffix(key, this.version)
}

VersionStorage.prototype._isGuarded = function (key, cacheGuarded) {
  const guarded = cacheGuarded || storage.get(GUARDED)
  return guarded && guarded.indexOf(key) > -1
}

VersionStorage.prototype._init = function () {
  const localVersion = storage.get(VERSION)
  const localGuarded = storage.get(GUARDED)

  const versionLegal = localVersion && this.version === localVersion
  const guardedLegal = localGuarded &&
    Array.isArray(localGuarded) &&
    localGuarded.length > 0 &&
    this.guarded.every(guard => localGuarded.indexOf(guard) > -1)

  // 当前版本不匹配, 或者guarded字段不存在, 将默认guarded设为guarded, 然后清除非guarded字段
  if (!versionLegal || !guardedLegal) {
    storage.set(GUARDED, this.guarded)
    storage.set(VERSION, this.version)
    const all = storage.getAll()
    for (let key in all) {
      if (!this._isGuarded(key, this.guarded)) {
        storage.remove(key)
      }
    }
  }

  if (guardedLegal && this.guarded.length > localGuarded.length) {
    this.guarded = unique(this.guarded.concat(localGuarded))
    storage.set(GUARDED, this.guarded)
  }
}

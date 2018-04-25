import storage from './storage/storage'
import { suffix } from './utils/utils'

const GUARDED = 'guarded'
const VERSION = 'version'

export default function VersionStorage(version) {
  if (!version) {
    console.error('Constructor VersionStorage require a version at arguments[0]')
    return
  }
  this.version = version
  this.defaultGuarded = [GUARDED, VERSION]
  this._init()
}

VersionStorage.prototype.set = function (key, val) {
  const realKey = this._getKey(key)
  return storage.set(realKey, val)
}

VersionStorage.prototype.setWithoutVersion = function (key, val) {
  const guarded = storage.get(GUARDED)
  guarded.push(key)
  storage.set(GUARDED, guarded)
  return storage.set(key, val)
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
  const guarded = storage.get(GUARDED)
  const localVersion = storage.get(VERSION)
  if (!guarded ||
    !Array.isArray(guarded) ||
    !localVersion ||
    this.version !== localVersion) {
    storage.clear()
    storage.set(GUARDED, this.defaultGuarded)
    storage.set(VERSION, this.version)
  }
}

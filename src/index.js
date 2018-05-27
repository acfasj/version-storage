import storage from './storage/storage'
import { suffix, unique } from './utils/utils'

const GUARDED = 'guarded'
const VERSION = 'version'
const defaultGuarded = [GUARDED, VERSION]

export default class VersionStorage {
  constructor(version, guarded) {
    if (!version) {
      console.error('Constructor VersionStorage require a version at arguments[0]')
      return
    }
    this.version = version + ''
    if (guarded && Array.isArray(guarded)) {
      guarded = unique(guarded.concat(defaultGuarded))
    } else {
      guarded = defaultGuarded
    }
    this.guarded = guarded
    this._init()
  }

  /**
   * get a value in storage
   * @param {String} key
   * @param {Any} def default value
   */
  get (key, def) {
    const realKey = this._getKey(key)
    return storage.get(realKey, def)
  }

  /**
   * set a value in storage
   * @param {String} key
   * @param {Any} val
   * @param {Boolean} nosuffix without suffix on key
   */
  set(key, val, nosuffix = false) {
    const realKey = this._getKey(key)
    return storage.set(realKey, val)
  }

  /**
   * storage[key] !== undefined
   * @param {String} key
   */
  has (key) {
    const realKey = this._getKey(key)
    return storage.has(realKey)
  }

  remove (key) {
    const realKey = this._getKey(key)
    return storage.remove(realKey)
  }

  clear () {
    return storage.clear()
  }

  getAll() {
    return storage.getAll()
  }

  forEach(callback) {
    return storage.forEach(callback)
  }

  /**
   * return a real key whether has a suffix
   * @param {String} key
   */
  _getKey(key) {
    if (this._isGuarded(key)) {
      return key
    }
    return suffix(key, this.version)
  }

  /**
   * a key should be suffixed or not
   * @param {String} key
   * @param {Array} cacheGuarded
   */
  _isGuarded(key, cacheGuarded) {
    const guarded = cacheGuarded || storage.get(GUARDED)
    return guarded && guarded.indexOf(key) > -1
  }

  /**
   * called by constructor, detect the version suffix
   * if the version and the guarded matched, do nothing
   * else clear storage and init again
   */
  _init () {
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
}

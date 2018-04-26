(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VersionStorage = factory());
}(this, (function () { 'use strict';

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  function suffix(key, word) {
    var seperator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '_';

    return '' + key + seperator + word;
  }

  function unique(arr) {
    return [].concat(toConsumableArray(new Set(arr)));
  }

  function serialize(val) {
    return JSON.stringify(val);
  }

  function deserialize(val) {
    if (typeof val !== 'string') {
      return undefined;
    }
    try {
      return JSON.parse(val);
    } catch (e) {
      return val || undefined;
    }
  }

  /**
   * 本地存储实现,封装localStorage和sessionStorage
   */
  var store = {
    storage: window.localStorage,
    session: {
      storage: window.sessionStorage
    }
  };

  var api = {
    set: function set(key, val) {
      if (this.disabled) {
        return;
      }
      if (val === undefined) {
        return this.remove(key);
      }
      this.storage.setItem(key, serialize(val));
      return val;
    },
    get: function get(key, def) {
      if (this.disabled) {
        return def;
      }
      var val = deserialize(this.storage.getItem(key));
      return val === undefined ? def : val;
    },
    has: function has(key) {
      return this.get(key) !== undefined;
    },
    remove: function remove(key) {
      if (this.disabled) {
        return;
      }
      this.storage.removeItem(key);
    },
    clear: function clear() {
      if (this.disabled) {
        return;
      }
      this.storage.clear();
    },
    getAll: function getAll() {
      if (this.disabled) {
        return null;
      }
      var ret = {};
      this.forEach(function (key, val) {
        ret[key] = val;
      });
      return ret;
    },
    forEach: function forEach(callback) {
      if (this.disabled) {
        return;
      }
      for (var i = 0; i < this.storage.length; i++) {
        var key = this.storage.key(i);
        callback(key, this.get(key));
      }
    }
  };

  Object.assign(store, api);

  Object.assign(store.session, api);

  try {
    var testKey = '__storejs__';
    store.set(testKey, testKey);
    if (store.get(testKey) !== testKey) {
      store.disabled = true;
    }
    store.remove(testKey);
  } catch (e) {
    store.disabled = true;
  }

  var GUARDED = 'guarded';
  var VERSION = 'version';
  var defaultGuarded = [GUARDED, VERSION];

  function VersionStorage(version, guarded) {
    if (!version) {
      console.error('Constructor VersionStorage require a version at arguments[0]');
      return;
    }
    this.version = version + '';
    if (guarded && Array.isArray(guarded)) {
      guarded = unique(guarded.concat(defaultGuarded));
    } else {
      guarded = defaultGuarded;
    }
    this.guarded = guarded;
    this._init();
  }

  VersionStorage.prototype.set = function (key, val) {
    var nosuffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (!nosuffix) {
      var realKey = this._getKey(key);
      return store.set(realKey, val);
    }
    var guarded = store.get(GUARDED);
    guarded = unique(guarded.concat(key));
    store.set(GUARDED, guarded);
    this.guarded = guarded;
    return store.set(key, val);
  };

  VersionStorage.prototype.setDirect = function (key, val) {
    return this.set(key, val, true);
  };

  VersionStorage.prototype.get = function (key, def) {
    var realKey = this._getKey(key);
    return store.get(realKey, def);
  };

  VersionStorage.prototype.has = function (key) {
    var realKey = this._getKey(key);
    return store.has(realKey);
  };

  VersionStorage.prototype.remove = function (key) {
    var realKey = this._getKey(key);
    return store.remove(realKey);
  };

  VersionStorage.prototype.clear = function () {
    return store.clear();
  };

  VersionStorage.prototype.getAll = function () {
    return store.getAll();
  };

  VersionStorage.prototype.forEach = function (callback) {
    return store.forEach(callback);
  };

  VersionStorage.prototype._getKey = function (key) {
    if (this._isGuarded(key)) {
      return key;
    }
    return suffix(key, this.version);
  };

  VersionStorage.prototype._isGuarded = function (key, cacheGuarded) {
    var guarded = cacheGuarded || store.get(GUARDED);
    return guarded && guarded.indexOf(key) > -1;
  };

  VersionStorage.prototype._init = function () {
    var localVersion = store.get(VERSION);
    var localGuarded = store.get(GUARDED);

    var versionLegal = localVersion && this.version === localVersion;
    var guardedLegal = localGuarded && Array.isArray(localGuarded) && localGuarded.length > 0 && this.guarded.every(function (guard) {
      return localGuarded.indexOf(guard) > -1;
    });

    // 当前版本不匹配, 或者guarded字段不存在, 将默认guarded设为guarded, 然后清除非guarded字段
    if (!versionLegal || !guardedLegal) {
      store.set(GUARDED, this.guarded);
      store.set(VERSION, this.version);
      var all = store.getAll();
      for (var key in all) {
        if (!this._isGuarded(key, this.guarded)) {
          store.remove(key);
        }
      }
    }

    if (guardedLegal && this.guarded.length > localGuarded.length) {
      this.guarded = unique(this.guarded.concat(localGuarded));
      store.set(GUARDED, this.guarded);
    }
  };

  return VersionStorage;

})));

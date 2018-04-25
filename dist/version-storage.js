(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VersionStorage = factory());
}(this, (function () { 'use strict';

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

  function suffix(key, word) {
    var seperator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '_';

    return '' + key + seperator + word;
  }

  var GUARDED = 'guarded';
  var VERSION = 'version';

  function VersionStorage(version) {
    if (!version) {
      console.error('Constructor VersionStorage require a version at arguments[0]');
      return;
    }
    this.version = version;
    this.defaultGuarded = [GUARDED, VERSION];
    this._init();
  }

  VersionStorage.prototype.set = function (key, val) {
    var realKey = this._getKey(key);
    return store.set(realKey, val);
  };

  VersionStorage.prototype.setWithoutVersion = function (key, val) {
    var guarded = store.get(GUARDED);
    guarded.push(key);
    store.set(GUARDED, guarded);
    return store.set(key, val);
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
    var guarded = store.get(GUARDED);
    var localVersion = store.get(VERSION);
    if (!guarded || !Array.isArray(guarded) || !localVersion || this.version !== localVersion) {
      store.clear();
      store.set(GUARDED, this.defaultGuarded);
      store.set(VERSION, this.version);
    }
  };

  return VersionStorage;

})));

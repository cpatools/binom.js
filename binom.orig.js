(function () {
  'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function passClickIdToUrl(url) {
    var matched = location.search.match(/[?&](clickid|uclick)=([^=&]*)/);
    var normalizedUrl = url.trim();

    if (!matched) {
      return normalizedUrl;
    }

    var _matched = _slicedToArray(matched, 3),
        clickIdParamName = _matched[1],
        clickIdParamValue = _matched[2];

    var clickIdParam = "".concat(clickIdParamName, "=").concat(clickIdParamValue);

    if (normalizedUrl.indexOf('?') === -1) {
      return "".concat(normalizedUrl, "?").concat(clickIdParam);
    }

    if (normalizedUrl.endsWith('?')) {
      return "".concat(normalizedUrl).concat(clickIdParam);
    }

    return "".concat(normalizedUrl, "&").concat(clickIdParam);
  }

  function OptionsStore() {
    this.domain = window.location.hostname;
    this.clickAlias = 'click.php';

    this.init = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          domain = _ref.domain,
          clickAlias = _ref.clickAlias;

      this.domain = domain !== null && domain !== void 0 ? domain : this.domain;
      this.clickAlias = clickAlias !== null && clickAlias !== void 0 ? clickAlias : this.clickAlias;
    };

    this.getOptions = function () {
      var _optionsToOverride$do, _optionsToOverride$cl;

      var optionsToOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return {
        domain: (_optionsToOverride$do = optionsToOverride.domain) !== null && _optionsToOverride$do !== void 0 ? _optionsToOverride$do : this.domain,
        clickAlias: (_optionsToOverride$cl = optionsToOverride.clickAlias) !== null && _optionsToOverride$cl !== void 0 ? _optionsToOverride$cl : this.clickAlias
      };
    };
  }

  var optionsStore = new OptionsStore();

  function stringifyTokens(tokens) {
    return Object.keys(tokens).map(function (tokenName) {
      return "".concat(tokenName, "=").concat(tokens[tokenName]);
    }).join('&');
  }

  function sendTokens(tokens, options) {
    var _optionsStore$getOpti = optionsStore.getOptions(options),
        domain = _optionsStore$getOpti.domain,
        clickAlias = _optionsStore$getOpti.clickAlias;

    var image = document.createElement('img');
    image.src = passClickIdToUrl("https://".concat(domain, "/").concat(clickAlias, "?").concat(stringifyTokens(tokens)));
    image.referrerPolicy = 'no-referrer-when-downgrade';
  }

  function detectTimeout(tokenName, timeoutInSeconds, options) {
    setTimeout(function () {
      sendTokens(_defineProperty({}, tokenName, '1'), options);
    }, timeoutInSeconds * 1000);
  }

  function detectScroll(tokenName, options) {
    var isScrolled = false;
    window.addEventListener('scroll', function () {
      if (isScrolled) {
        return;
      }

      isScrolled = true;
      sendTokens(_defineProperty({}, tokenName, '1'), options);
    });
  }

  window.BinomSDK = {
    options: optionsStore,
    sendTokens: sendTokens,
    detectTimeout: detectTimeout,
    detectScroll: detectScroll
  };

})();

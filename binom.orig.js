(function () {
  'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

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

  function getClickIdParams() {
    var matchedList = Array.from(location.search.matchAll(/[?&](clickid|uclick)=([^=&]*)/g));

    if (matchedList.length === 0) {
      return null;
    }

    return matchedList.reduce(function (summary, matched) {
      return _objectSpread2(_objectSpread2({}, summary), {}, _defineProperty({}, matched[1], "".concat(matched[1], "=").concat(matched[2])));
    }, {});
  }

  function getDividerBetweenUrlAndClickIdParam(url) {
    if (url.indexOf('?') === -1) {
      return '?';
    }

    if (url.endsWith('?')) {
      return '';
    }

    return '&';
  }

  function passClickIdToUrl(url) {
    var _clickIdParams$expect;

    var expectedClickIdParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'clickid';
    var normalizedUrl = url.trim();
    var clickIdParams = getClickIdParams();

    if (clickIdParams === null) {
      return normalizedUrl;
    }

    var clickIdParam = (_clickIdParams$expect = clickIdParams[expectedClickIdParam]) !== null && _clickIdParams$expect !== void 0 ? _clickIdParams$expect : Object.values(clickIdParams)[0];
    var divider = getDividerBetweenUrlAndClickIdParam(normalizedUrl);
    return "".concat(normalizedUrl).concat(divider).concat(clickIdParam);
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

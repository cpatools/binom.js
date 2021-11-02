/*!
 * Binom.js v0.0.7
 */
var BinomJS = (function () {
  'use strict';

  function getClickIdParams() {
    var matchedList = Array.from(location.search.matchAll(/[?&](clickid|uclick)=([^=&]*)/g));

    if (matchedList.length === 0) {
      return null;
    }

    return matchedList.reduce(function (summary, matched) {
      var _Object$assign;

      return Object.assign(Object.assign({}, summary), {}, (_Object$assign = {}, _Object$assign[matched[1]] = "".concat(matched[2]), _Object$assign));
    }, {});
  }

  function chooseClickIdTokenName(clickIdParams, priority) {
    if (clickIdParams[priority]) {
      return priority;
    }

    return Object.keys(clickIdParams)[0];
  }

  function chooseClickIdToken(clickIdParams, priority) {
    var name = chooseClickIdTokenName(clickIdParams, priority);
    return {
      name: name,
      value: clickIdParams[name]
    };
  }

  function passClickIdToSendingTokens(sendingTokens) {
    var _clickIdParams$clicki;

    var clickIdParams = getClickIdParams();

    if (clickIdParams === null) {
      return sendingTokens;
    }

    if (!sendingTokens.cnv_id) {
      var _Object$assign;

      var _chooseClickIdToken = chooseClickIdToken(clickIdParams, 'uclick'),
          clickIdTokenName = _chooseClickIdToken.name,
          clickIdTokenValue = _chooseClickIdToken.value;

      return Object.assign(Object.assign({}, sendingTokens), {}, (_Object$assign = {}, _Object$assign[clickIdTokenName] = clickIdTokenValue, _Object$assign));
    }

    if (clickIdParams.uclick) {
      return Object.assign(Object.assign({}, sendingTokens), {}, {
        uclick: clickIdParams.uclick
      });
    }

    return Object.assign(Object.assign({}, sendingTokens), {}, {
      cnv_id: (_clickIdParams$clicki = clickIdParams.clickid) !== null && _clickIdParams$clicki !== void 0 ? _clickIdParams$clicki : resultTokens.cnv_id
    });
  }

  function stringifyTokens(tokens) {
    return Object.keys(tokens).map(function (tokenName) {
      return "".concat(tokenName, "=").concat(tokens[tokenName]);
    }).join('&');
  }

  function resolveTokens(tokens, context) {
    var resultTokens = {};
    var promises = [];
    Object.keys(tokens).forEach(function (tokenName) {
      var valueOrFunction = tokens[tokenName];

      if (typeof valueOrFunction !== 'function') {
        resultTokens[tokenName] = valueOrFunction;
        return;
      }

      var result = valueOrFunction(context);

      if (!(result instanceof Promise)) {
        resultTokens[tokenName] = result;
        return;
      }

      promises.push(result);
      result.then(function (finalResult) {
        resultTokens[tokenName] = finalResult;
      });
    });

    if (promises.length === 0) {
      return {
        then: function then(callback) {
          callback(resultTokens);
        }
      };
    }

    return new Promise(function (resolve) {
      return Promise.all(promises).then(function () {
        resolve(resultTokens);
      });
    });
  }

  function getOptions(options) {
    var _BinomJS;

    if (!((_BinomJS = BinomJS) !== null && _BinomJS !== void 0 && _BinomJS.options)) {
      return options;
    }

    return BinomJS.options.getOptions(options);
  }

  function makeRequestUrl(tokens, options) {
    var _getOptions = getOptions(options),
        host = _getOptions.host,
        clickAlias = _getOptions.clickAlias;

    var baseUrl = "https://".concat([host, clickAlias].join('/').replace(/\/{2,}/g, '/'));
    var query = stringifyTokens(tokens);
    return "".concat(baseUrl, "?").concat(query);
  }

  function sendTokens(tokens, context, options) {
    resolveTokens(passClickIdToSendingTokens(tokens), context).then(function (resultTokens) {
      var image = document.createElement('img');
      image.src = makeRequestUrl(resultTokens, options);
      image.referrerPolicy = 'no-referrer-when-downgrade';
    });
  }

  function normalizeTokens(tokensOrTokenName) {
    if (typeof tokensOrTokenName === 'string') {
      var _ref2;

      return _ref2 = {}, _ref2[tokensOrTokenName] = function (_ref) {
        var isMobile = _ref.isMobile;
        return isMobile ? 1 : 0;
      }, _ref2;
    }

    return tokensOrTokenName;
  }

  function detectMobile(tokensOrTokenName, options) {
    var isMobile = typeof window.orientation !== 'undefined';
    sendTokens(normalizeTokens(tokensOrTokenName), {
      isMobile: isMobile
    }, options);
  }

  function detectTimeout(tokenName, timeoutInSeconds, options) {
    setTimeout(function () {
      var _sendTokens;

      sendTokens((_sendTokens = {}, _sendTokens[tokenName] = '1', _sendTokens), options);
    }, timeoutInSeconds * 1000);
  }

  function detectScroll(tokenName, options) {
    var isScrolled = false;
    window.addEventListener('scroll', function () {
      var _sendTokens;

      if (isScrolled) {
        return;
      }

      isScrolled = true;
      sendTokens((_sendTokens = {}, _sendTokens[tokenName] = '1', _sendTokens), options);
    });
  }

  function OptionsStore() {
    this.host = window.location.hostname;
    this.clickAlias = 'click.php';

    this.init = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          host = _ref.host,
          clickAlias = _ref.clickAlias;

      this.host = host !== null && host !== void 0 ? host : this.host;
      this.clickAlias = clickAlias !== null && clickAlias !== void 0 ? clickAlias : this.clickAlias;
    };

    this.getOptions = function () {
      var _optionsToOverride$ho, _optionsToOverride$cl;

      var optionsToOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return {
        host: (_optionsToOverride$ho = optionsToOverride.host) !== null && _optionsToOverride$ho !== void 0 ? _optionsToOverride$ho : this.host,
        clickAlias: (_optionsToOverride$cl = optionsToOverride.clickAlias) !== null && _optionsToOverride$cl !== void 0 ? _optionsToOverride$cl : this.clickAlias
      };
    };
  }

  var optionsStore = new OptionsStore();

  var index = {
    options: optionsStore,
    init: function init(options) {
      optionsStore.init(options);
    },
    sendTokens: sendTokens,
    detectTimeout: detectTimeout,
    detectMobile: detectMobile,
    detectScroll: detectScroll
  };

  return index;

})();

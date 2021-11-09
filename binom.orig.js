/*!
 * Binom.js v0.0.7
 */
var BinomJS = (function () {
  'use strict';

  function extractClickIdParamsFromCookies$1() {
    var uclickFieldName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'uclick';
    return Array.from(document.cookie.matchAll(new RegExp("(?:^|; )(clickid|".concat(uclickFieldName, ")=([^;]*)"), 'g'))).map(function (matched) {
      return {
        name: matched[1],
        value: matched[2]
      };
    });
  }

  function extractClickIdParamsFromCookies(url) {
    var _url$match;

    var uclickFieldName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'uclick';
    var searchString = (_url$match = url.match(/\?.+?$/)) === null || _url$match === void 0 ? void 0 : _url$match[0];

    if (!searchString) {
      return [];
    }

    return Array.from(searchString.matchAll(new RegExp("[?&](clickid|".concat(uclickFieldName, ")=([^=&]*)"), 'g'))).map(function (matched) {
      return {
        name: matched[1],
        value: matched[2]
      };
    });
  }

  function getClickIdParams(extractor) {
    var extractedClickIdsList = extractor();

    if (extractedClickIdsList.length === 0) {
      return {};
    }

    return extractedClickIdsList.reduce(function (summary, extractedClickId) {
      var _Object$assign;

      return Object.assign(summary, (_Object$assign = {}, _Object$assign[extractedClickId.name] = "".concat(extractedClickId.value), _Object$assign));
    }, {});
  }

  function pairs(listLeft, listRight) {
    return listLeft.reduce(function (summary, itemFromListLeft) {
      return summary.concat(listRight.map(function (itemFromListRight) {
        return [itemFromListLeft, itemFromListRight];
      }));
    }, []);
  }

  function getClickIdToken() {
    var uclickFieldName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'uclick';
    var clickIdCookies = getClickIdParams(function () {
      return extractClickIdParamsFromCookies$1(uclickFieldName);
    });
    var clickIdReferrerParams = getClickIdParams(function () {
      return extractClickIdParamsFromCookies(document.referrer, uclickFieldName);
    });
    var clickIdGetParams = getClickIdParams(function () {
      return extractClickIdParamsFromCookies(document.location.search, uclickFieldName);
    });
    var fields = [uclickFieldName, 'clickid'];
    var sources = [clickIdCookies, clickIdReferrerParams, clickIdGetParams];
    return pairs(fields, sources).map(function (pair) {
      return {
        name: pair[0],
        value: pair[1][pair[0]]
      };
    }).find(function (pair) {
      return pair.value;
    }) || null;
  }

  function normalizeHost(host) {
    return host.trim().replace(/(^\/+|\/+$)/g, '');
  }

  function normalizeFileName(fileName) {
    var shouldAppendPhpExtension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var trimmedFileName = fileName.trim().replace(/(^\/+|\/+$)/g, '');
    var postfix = shouldAppendPhpExtension && !fileName.endsWith('.php') ? '.php' : '';
    return "".concat(trimmedFileName).concat(postfix);
  }

  function resolveUrl(host, fileName) {
    var shouldAppendPhpExtension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var normalizedHost = normalizeHost(host);
    var prefix = !normalizedHost.startsWith('http') ? 'https://' : '';
    var normalizedFileName = normalizeFileName(fileName, shouldAppendPhpExtension);
    return "".concat(prefix).concat(normalizedHost, "/").concat(normalizedFileName);
  }

  function initOptionsWithDefaults() {
    if (window.BinomJSOptions) {
      return;
    }

    window.BinomJSOptions = {
      host: normalizeHost(window.location.hostname),
      clickAlias: 'click.php'
    };
  }

  function getOptions() {
    var optionsToOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    initOptionsWithDefaults();
    var options = {
      host: optionsToOverride.host ? normalizeHost(optionsToOverride.host) : window.BinomJSOptions.host,
      clickAlias: optionsToOverride.clickAlias ? normalizeFileName(optionsToOverride.clickAlias, true) : window.BinomJSOptions.clickAlias
    };
    var clickUrl = resolveUrl(options.host, options.clickAlias, true);
    return Object.assign({
      clickUrl: clickUrl
    }, optionsToOverride, options);
  }

  function passClickIdToSendingTokens(sendingTokens, options) {
    var uclickFieldName = getOptions(options).uclickFieldName || 'uclick';
    var clickIdToken = getClickIdToken(uclickFieldName);

    if (clickIdToken === null) {
      return sendingTokens;
    }

    if (!sendingTokens.cnv_id || clickIdToken.name === uclickFieldName) {
      var _Object$assign;

      return Object.assign({}, sendingTokens, (_Object$assign = {}, _Object$assign[clickIdToken.name] = clickIdToken.value, _Object$assign));
    }

    return Object.assign({}, sendingTokens, {
      cnv_id: clickIdToken.value || sendingTokens.cnv_id
    });
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

  function stringifyTokens(tokens) {
    return Object.keys(tokens).map(function (tokenName) {
      return "".concat(tokenName, "=").concat(tokens[tokenName]);
    }).join('&');
  }

  function makeRequestUrl(tokens, options) {
    var clickUrl = getOptions(options).clickUrl;
    var query = stringifyTokens(tokens);
    return "".concat(clickUrl, "?").concat(query);
  }

  function sendTokensToClickScript(tokens, options) {
    var image = document.createElement('img');
    image.src = makeRequestUrl(tokens, options);
    image.referrerPolicy = 'no-referrer-when-downgrade';
  }

  function sendTokens(tokens, context, options) {
    resolveTokens(passClickIdToSendingTokens(tokens, options), context).then(function (resultTokens) {
      sendTokensToClickScript(resultTokens, options);
    });
  }

  function normalizeTokens(tokensOrTokenName) {
    if (typeof tokensOrTokenName === 'string') {
      var _ref;

      return _ref = {}, _ref[tokensOrTokenName] = function (context) {
        return context.isMobile ? 1 : 0;
      }, _ref;
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

  function setClickAlias(clickAlias) {
    initOptionsWithDefaults();
    window.BinomJSOptions.clickAlias = normalizeFileName(clickAlias, true);
  }

  function setHost(host) {
    initOptionsWithDefaults();
    window.BinomJSOptions.host = normalizeHost(host);
  }

  function initOptions(options) {
    setHost(options.host);
    setClickAlias(options.clickAlias);
  }

  var index = {
    init: function init(options) {
      initOptions(options);
    },
    sendTokens: sendTokens,
    detectTimeout: detectTimeout,
    detectMobile: detectMobile,
    detectScroll: detectScroll
  };

  return index;

})();

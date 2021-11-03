(function () {
  'use strict';

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

  function OptionsStore() {
    this.host = normalizeHost(window.location.hostname);
    this.clickAlias = 'click.php';

    this.__setHost = function (host) {
      this.host = normalizeHost(host);
    };

    this.__setClickAlias = function (clickAlias) {
      this.clickAlias = normalizeFileName(clickAlias, true);
    };

    this.init = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          host = _ref.host,
          clickAlias = _ref.clickAlias;

      this.__setHost(host !== null && host !== void 0 ? host : this.host);

      this.__setClickAlias(clickAlias !== null && clickAlias !== void 0 ? clickAlias : this.clickAlias);
    };

    this.getOptions = function () {
      var _optionsToOverride$ho, _optionsToOverride$cl;

      var optionsToOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = {
        host: normalizeHost((_optionsToOverride$ho = optionsToOverride.host) !== null && _optionsToOverride$ho !== void 0 ? _optionsToOverride$ho : this.host),
        clickAlias: normalizeFileName((_optionsToOverride$cl = optionsToOverride.clickAlias) !== null && _optionsToOverride$cl !== void 0 ? _optionsToOverride$cl : this.clickAlias, true)
      };
      var clickUrl = resolveUrl(options.host, options.clickAlias, true);
      return Object.assign(Object.assign({}, options), {}, {
        clickUrl: clickUrl
      });
    };
  }

  if (!window.BinomJSOptions) {
    window.BinomJSOptions = new OptionsStore();
  }

  var optionsStore = window.BinomJSOptions;

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

      return Object.assign(Object.assign({}, summary), {}, (_Object$assign = {}, _Object$assign[extractedClickId.name] = "".concat(extractedClickId.value), _Object$assign));
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
    var _pairs$map$find;

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
    return (_pairs$map$find = pairs(fields, sources).map(function (pair) {
      return {
        name: pair[0],
        value: pair[1][pair[0]]
      };
    }).find(function (_ref) {
      var value = _ref.value;
      return value;
    })) !== null && _pairs$map$find !== void 0 ? _pairs$map$find : null;
  }

  function passClickIdToSendingTokens(sendingTokens, options) {
    var _clickIdToken$value;

    var _optionsStore$getOpti = optionsStore.getOptions(options),
        _optionsStore$getOpti2 = _optionsStore$getOpti.uclickFieldName,
        uclickFieldName = _optionsStore$getOpti2 === void 0 ? 'uclick' : _optionsStore$getOpti2;

    var clickIdToken = getClickIdToken(uclickFieldName);

    if (clickIdToken === null) {
      return sendingTokens;
    }

    if (!sendingTokens.cnv_id) {
      var _Object$assign;

      return Object.assign(Object.assign({}, sendingTokens), {}, (_Object$assign = {}, _Object$assign[clickIdToken.name] = clickIdToken.value, _Object$assign));
    }

    if (clickIdToken.name === uclickFieldName) {
      var _Object$assign2;

      return Object.assign(Object.assign({}, sendingTokens), {}, (_Object$assign2 = {}, _Object$assign2[clickIdToken.name] = clickIdToken.value, _Object$assign2));
    }

    return Object.assign(Object.assign({}, sendingTokens), {}, {
      cnv_id: (_clickIdToken$value = clickIdToken.value) !== null && _clickIdToken$value !== void 0 ? _clickIdToken$value : sendingTokens.cnv_id
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

  function makeRequestUrl(tokens, options) {
    var _optionsStore$getOpti = optionsStore.getOptions(options),
        clickUrl = _optionsStore$getOpti.clickUrl;

    var query = stringifyTokens(tokens);
    return "".concat(clickUrl, "?").concat(query);
  }

  function sendTokens(tokens, context, options) {
    resolveTokens(passClickIdToSendingTokens(tokens, options), context).then(function (resultTokens) {
      var image = document.createElement('img');
      image.src = makeRequestUrl(resultTokens, options);
      image.referrerPolicy = 'no-referrer-when-downgrade';
    });
  }

  function conversionPixel(options) {
    sendTokens({
      cnv_id: 'OPTIONAL',
      payout: 'OPTIONAL'
    }, {}, options);
  }

  conversionPixel({
    host: "<?php echo $arr_tpl[\"domain_url\"]; ?>",
    clickAlias: "<?php echo $arr_tpl[\"settings\"][\"custom_url\"][\"click\"]; ?>",
    uclickFieldName: "<?php echo protection::get_key(\"uclick\",1);?>"
  });

})();

/*!
 * Binom.js v0.0.7
 */
this.BinomJS = this.BinomJS || {};
this.BinomJS.detectScroll = (function () {
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

  return detectScroll;

})();

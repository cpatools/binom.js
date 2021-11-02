/*!
 * Binom.js v0.0.6
 */
this.BinomJS = this.BinomJS || {};
this.BinomJS.detectTimeout = (function () {
  'use strict';

  function getClickIdParams() {
    var matchedList = Array.from(location.search.matchAll(/[?&](clickid|uclick)=([^=&]*)/g));

    if (matchedList.length === 0) {
      return null;
    }

    return matchedList.reduce(function (summary, matched) {
      var _Object$assign;

      return Object.assign(Object.assign({}, summary), {}, (_Object$assign = {}, _Object$assign[matched[1]] = "".concat(matched[1], "=").concat(matched[2]), _Object$assign));
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

  function stringifyTokens(tokens, context) {
    return Object.keys(tokens).map(function (tokenName) {
      var valueOrFunction = tokens[tokenName];
      var value = typeof valueOrFunction === 'function' ? valueOrFunction(context) : valueOrFunction;
      return "".concat(tokenName, "=").concat(value);
    }).join('&');
  }

  function getOptions(options) {
    var _BinomJS;

    if (!((_BinomJS = BinomJS) !== null && _BinomJS !== void 0 && _BinomJS.options)) {
      return options;
    }

    return BinomJS.options.getOptions(options);
  }

  function makeRequestUrl(tokens, context, options) {
    var _getOptions = getOptions(options),
        domain = _getOptions.domain,
        clickAlias = _getOptions.clickAlias;

    var baseUrl = "https://".concat(domain, "/").concat(clickAlias);
    var query = stringifyTokens(passClickIdToSendingTokens(tokens), context);
    return "".concat(baseUrl, "?").concat(query);
  }

  function sendTokens(tokens, context, options) {
    var image = document.createElement('img');
    image.src = makeRequestUrl(tokens, context, options);
    image.referrerPolicy = 'no-referrer-when-downgrade';
  }

  function detectTimeout(tokenName, timeoutInSeconds, options) {
    setTimeout(function () {
      var _sendTokens;

      sendTokens((_sendTokens = {}, _sendTokens[tokenName] = '1', _sendTokens), options);
    }, timeoutInSeconds * 1000);
  }

  return detectTimeout;

})();

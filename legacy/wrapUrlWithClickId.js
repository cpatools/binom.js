/*!
 * Binom.js v0.0.7
 */
this.BinomJS = this.BinomJS || {};
this.BinomJS.wrapUrlWithClickId = (function () {
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

  function appendParam(url, paramName, value) {
    var normalizedUrl = url.trim();
    var param = "".concat(paramName, "=").concat(value);

    if (normalizedUrl.indexOf('?') === -1) {
      return "".concat(normalizedUrl, "?").concat(param);
    }

    if (normalizedUrl.endsWith('?')) {
      return "".concat(normalizedUrl).concat(param);
    }

    return "".concat(normalizedUrl, "&").concat(param);
  }

  function setParam(url, paramName, value) {
    var result = url.replace(new RegExp("".concat(paramName, "=[^=&]"), "".concat(paramName, "=").concat(value)));

    if (result.indexOf(paramName) !== -1) {
      return result;
    }

    return appendParam(url, paramName, value);
  }

  function wrapUrlWithClickId(url) {
    var clickIdParams = getClickIdParams();

    if (clickIdParams === null) {
      return url;
    }

    if (!url.includes('cnv_id')) {
      var _chooseClickIdToken = chooseClickIdToken(clickIdParams, 'uclick'),
          clickIdTokenName = _chooseClickIdToken.name,
          clickIdTokenValue = _chooseClickIdToken.value;

      return setParam(url, clickIdTokenName, clickIdTokenValue);
    }

    if (clickIdParams.uclick) {
      return setParam(url, 'uclick', clickIdParams.uclick);
    }

    return setParam(url, 'cnv_id', clickIdParams.clickid);
  }

  return wrapUrlWithClickId;

})();

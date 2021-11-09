this.BinomJS = this.BinomJS || {};
this.BinomJS.wrapUrlWithClickId = (function () {
  'use strict';

  function extractClickIdParamsFromCookies$1(uclickFieldName) {
    if (uclickFieldName === void 0) {
      uclickFieldName = 'uclick';
    }

    return Array.from(document.cookie.matchAll(new RegExp("(?:^|; )(clickid|" + uclickFieldName + ")=([^;]*)", 'g'))).map(function (matched) {
      return {
        name: matched[1],
        value: matched[2]
      };
    });
  }

  function extractClickIdParamsFromCookies(url, uclickFieldName) {
    var _url$match;

    if (uclickFieldName === void 0) {
      uclickFieldName = 'uclick';
    }

    var searchString = (_url$match = url.match(/\?.+?$/)) === null || _url$match === void 0 ? void 0 : _url$match[0];

    if (!searchString) {
      return [];
    }

    return Array.from(searchString.matchAll(new RegExp("[?&](clickid|" + uclickFieldName + ")=([^=&]*)", 'g'))).map(function (matched) {
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

      return Object.assign(summary, (_Object$assign = {}, _Object$assign[extractedClickId.name] = "" + extractedClickId.value, _Object$assign));
    }, {});
  }

  function pairs(listLeft, listRight) {
    return listLeft.reduce(function (summary, itemFromListLeft) {
      return summary.concat(listRight.map(function (itemFromListRight) {
        return [itemFromListLeft, itemFromListRight];
      }));
    }, []);
  }

  function getClickIdToken(uclickFieldName) {
    if (uclickFieldName === void 0) {
      uclickFieldName = 'uclick';
    }

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

  function appendParam(url, paramName, value) {
    var normalizedUrl = url.trim();
    var param = paramName + "=" + value;

    if (normalizedUrl.indexOf('?') === -1) {
      return normalizedUrl + "?" + param;
    }

    if (normalizedUrl.endsWith('?')) {
      return "" + normalizedUrl + param;
    }

    return normalizedUrl + "&" + param;
  }

  function setParam(url, paramName, value) {
    var result = url.replace(new RegExp(paramName + "=[^=&]*", 'g'), paramName + "=" + value);

    if (result.indexOf(paramName) !== -1) {
      return result;
    }

    return appendParam(url, paramName, value);
  }

  function wrapUrlWithClickId(url, uclickFieldName) {
    if (uclickFieldName === void 0) {
      uclickFieldName = 'uclick';
    }

    var clickIdToken = getClickIdToken(uclickFieldName);

    if (clickIdToken === null) {
      return url;
    }

    if (!url.includes('cnv_id')) {
      return setParam(url, clickIdToken.name, clickIdToken.value);
    }

    if (clickIdToken.name === uclickFieldName) {
      return setParam(url, clickIdToken.name, clickIdToken.value);
    }

    if (clickIdToken.value) {
      return setParam(url, 'cnv_id', clickIdToken.value);
    }

    return url;
  }

  return wrapUrlWithClickId;

})();

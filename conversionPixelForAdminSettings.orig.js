(function () {
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

  function makeUrl(host, clickAlias, uclickFieldName) {
    var baseUrl = "" + host + clickAlias + ".php?payout=OPTIONAL";
    var clickIdToken = getClickIdToken(uclickFieldName);

    if (!clickIdToken) {
      return baseUrl + "&cnv_id=OPTIONAL";
    }

    var cnvIdValue = clickIdToken.name === uclickFieldName ? 'OPTIONAL' : clickIdToken.value;
    var uclickParam = clickIdToken.name === uclickFieldName ? "&" + uclickFieldName + "=" + clickIdToken.value : '';
    return baseUrl + "&cnv_id=" + cnvIdValue + uclickParam;
  }

  (function (host, clickAlias, uclickFieldName) {
    var image = document.createElement('img');
    image.src = makeUrl(host, clickAlias, uclickFieldName);
    image.referrerPolicy = 'no-referrer-when-downgrade';
  })("<?php echo $arr_tpl[\"domain_url\"]; ?>", "<?php echo $arr_tpl[\"settings\"][\"custom_url\"][\"click\"]; ?>", "<?php echo protection::get_key(\"uclick\",1);?>");

})();

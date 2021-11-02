(function () {
  'use strict';

  function getUclick(uclickFieldName) {
    var _document$cookie$matc, _location$search$matc;

    var uclickCookie = (_document$cookie$matc = document.cookie.match(new RegExp("(?:^|; )".concat(uclickFieldName, "=([^;]*)")))) === null || _document$cookie$matc === void 0 ? void 0 : _document$cookie$matc[1];
    var uclickGetParam = (_location$search$matc = location.search.match(new RegExp("[?&]".concat(uclickFieldName, "=([^=&]*)")))) === null || _location$search$matc === void 0 ? void 0 : _location$search$matc[1];
    return uclickCookie || uclickGetParam || undefined;
  }

  function conversionPixel(url, clickAlias, uclickFieldName) {
    var image = document.createElement('img');
    image.src = "".concat(url).concat(clickAlias, "?cnv_id=OPTIONAL&payout=OPTIONAL&").concat(uclickFieldName, "=").concat(getUclick(uclickFieldName));
  }

  conversionPixel('<?php echo $arr_tpl["domain_url"]; ?>', '<?php echo $arr_tpl["settings"]["custom_url"]["click"]; ?>', '<?php echo protection::get_key("uclick",1);?>');

})();

/*eslint-disable */
define([], function () {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var Margins =
  /*#__PURE__*/
  function () {
    function Margins() {}

    var _proto = Margins.prototype;

    /**
     * @param {string} value
     * @returns {Object | string}
     */
    _proto.fromDom = function fromDom(value) {
      var result = {};

      if (undefined !== value.margin) {
        result.margin = {
          bottom: value.margin.bottom.replace("px", ""),
          left: value.margin.left.replace("px", ""),
          right: value.margin.right.replace("px", ""),
          top: value.margin.top.replace("px", "")
        };
      }

      return result;
    };
    /**
     * @param {string} name
     * @param {Object} data
     * @returns {Object | string}
     */


    _proto.toDom = function toDom(name, data) {
      var value = data[name];

      if (typeof value === "string") {
        value = JSON.parse(value);
      }

      var result = {};

      if (undefined !== value && undefined !== value.margin) {
        result.marginLeft = value.margin.left + "px";
        result.marginTop = value.margin.top + "px";
        result.marginRight = value.margin.right + "px";
        result.marginBottom = value.margin.bottom + "px";
      }

      return result;
    };

    return Margins;
  }();

  return Margins;
});
//# sourceMappingURL=margins.js.map

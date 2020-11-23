/*eslint-disable */
/* jscs:disable */
define(["Magento_PageBuilder/js/events", "mageUtils", "underscore", "Magento_PageBuilder/js/config", "Magento_PageBuilder/js/data-store"], function (_events, _mageUtils, _underscore, _config, _dataStore) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var ContentType =
  /*#__PURE__*/
  function () {
    "use strict";

    /**
     * @param {ContentTypeInterface} parentContentType
     * @param {ContentTypeConfigInterface} config
     * @param {string} stageId
     */
    function ContentType(parentContentType, config, stageId) {
      this.id = _mageUtils.uniqueid();
      this.dataStore = new _dataStore();
      this.dataStores = {};
      this.dropped = false;
      this.parentContentType = parentContentType;
      this.config = config;
      this.stageId = stageId;
      this.initDataStores();
      this.bindEvents();
    }
    /**
     * Destroys current instance
     */


    var _proto = ContentType.prototype;

    _proto.destroy = function destroy() {
      var params = {
        contentType: this,
        index: this.parentContentType ? this.parentContentType.getChildren().indexOf(this) : null,
        parentContentType: this.parentContentType,
        stageId: this.stageId
      };
      this.preview ? this.preview.destroy() : this.content.destroy();

      _events.trigger("contentType:removeAfter", params);

      _events.trigger(this.config.name + ":removeAfter", params);
    }
    /**
     * Get viewport fields.
     *
     * @param {string} viewport
     * @param {DataObject} data
     */
    ;

    _proto.getViewportFields = function getViewportFields(viewport, data) {
      var viewportConfig = this.config.breakpoints[viewport];

      if (!viewportConfig) {
        return {};
      }

      return viewportConfig.fields[data.appearance + "-appearance"] || viewportConfig.fields.default;
    }
    /**
     * Get viewport fields that is different from default.
     *
     * @param {string} viewport
     * @param {DataObject} data
     */
    ;

    _proto.getDiffViewportFields = function getDiffViewportFields(viewport, data) {
      var fields = this.getViewportFields(viewport, data);

      var defaultData = this.dataStores[_config.getConfig("defaultViewport")].getState();

      var excludedFields = [];

      _underscore.each(fields, function (field, key) {
        var comparison = _mageUtils.compare(data[key], defaultData[key]);

        var isEmpty = !_underscore.find(comparison.changes, function (change) {
          return !_underscore.isEmpty(change.oldValue);
        });

        if (comparison.equal || isEmpty) {
          excludedFields.push(key);
        }
      });

      return _underscore.omit(fields, excludedFields);
    };

    _proto.bindEvents = function bindEvents() {
      var _this = this;

      var eventName = this.config.name + ":" + this.id + ":updateAfter";
      var paramObj = {};
      paramObj[this.id] = this;
      this.dataStore.subscribe(function (state) {
        var defaultViewport = _config.getConfig("defaultViewport");

        var viewport = _config.getConfig("viewport") || defaultViewport;

        if (viewport !== defaultViewport) {
          var viewportFields = _underscore.keys(_this.getDiffViewportFields(viewport, state));

          _this.dataStores[defaultViewport].setState(_underscore.extend(_this.dataStores[defaultViewport].getState(), _underscore.omit(state, viewportFields)));

          _this.dataStores[viewport].setState(_underscore.extend(_this.dataStores[viewport].getState(), _underscore.pick(state, viewportFields)));
        } else {
          _this.dataStores[viewport].setState(state);
        }

        return _events.trigger(eventName, paramObj);
      });
      this.dataStore.subscribe(function () {
        return _events.trigger("stage:updateAfter", {
          stageId: _this.stageId
        });
      });

      _events.on("stage:" + this.stageId + ":viewportChangeAfter", this.onViewportSwitch.bind(this));
    }
    /**
     * Change data stores on viewport change.
     * @param {Object} args
     */
    ;

    _proto.onViewportSwitch = function onViewportSwitch(args) {
      var defaultViewport = _config.getConfig("defaultViewport");

      var currentViewportState = this.dataStores[args.viewport].getState();
      var defaultViewportState = this.dataStores[defaultViewport].getState();

      var viewportFields = _underscore.keys(this.getDiffViewportFields(args.viewport, currentViewportState)); // Filter viewport specific data for states


      this.dataStore.setState(_underscore.extend({}, defaultViewportState, _underscore.pick(currentViewportState, viewportFields)));
    }
    /**
     * Init data store for each viewport.
     */
    ;

    _proto.initDataStores = function initDataStores() {
      var _this2 = this;

      _underscore.each(_config.getConfig("viewports"), function (value, name) {
        _this2.dataStores[name] = new _dataStore();
      });
    };

    return ContentType;
  }();

  return ContentType;
});
//# sourceMappingURL=content-type.js.map
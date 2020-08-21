/*eslint-disable */
/* jscs:disable */
define(["consoleLogger", "knockout", "Magento_PageBuilder/js/events", "Magento_PageBuilder/js/content-type/appearance-config", "Magento_PageBuilder/js/content-type/observable-updater/attributes", "Magento_PageBuilder/js/content-type/observable-updater/css", "Magento_PageBuilder/js/content-type/observable-updater/html", "Magento_PageBuilder/js/content-type/observable-updater/style", "Magento_PageBuilder/js/content-type/style-registry"], function (_consoleLogger, _knockout, _events, _appearanceConfig, _attributes, _css, _html, _style, _styleRegistry) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var ObservableUpdater =
  /*#__PURE__*/
  function () {
    "use strict";

    /**
     * @param {typeof ConverterPool} converterPool
     * @param {typeof MassConverterPool} massConverterPool
     * @param {(config: object) => string} converterResolver
     * @param {typeof StyleRegistry} styleRegistry
     */
    function ObservableUpdater(converterPool, massConverterPool, converterResolver, styleRegistry) {
      this.previousData = {};
      this.bindingGenerators = {
        attributes: _attributes,
        css: _css,
        html: _html,
        style: _style
      };
      this.converterPool = converterPool;
      this.massConverterPool = massConverterPool;
      this.converterResolver = converterResolver;
      this.styleRegistry = styleRegistry;
    }
    /**
     * Update the associated viewModel with the generated data
     *
     * We create an API for each potential binding and make it available in the master and preview templates through
     * the data variable. Each data variable will have associated observables that are updated on a data change.
     *
     * @param {Preview} viewModel
     * @param {DataObject} data
     */


    var _proto = ObservableUpdater.prototype;

    _proto.update = function update(viewModel, data) {
      var appearance = data && data.appearance !== undefined ? data.appearance : undefined;
      var appearanceConfiguration = (0, _appearanceConfig)(viewModel.contentType.config.name, appearance);

      if (undefined === appearanceConfiguration || undefined === appearanceConfiguration.elements) {
        return;
      } // Generate Knockout bindings in objects for usage in preview and master templates


      var generatedBindings = this.generateKnockoutBindings(viewModel.contentType, appearanceConfiguration.elements, appearanceConfiguration.converters, data);

      var _loop = function _loop(element) {
        if (generatedBindings.hasOwnProperty(element)) {
          // Ensure every element is represented by an object
          if (viewModel.data[element] === undefined) {
            viewModel.data[element] = {};
          }
          /**
           * Iterate through each elements data (css, style, attributes) and apply data updates within the
           * observable. If no observable already exists create a new one.
           */


          Object.keys(generatedBindings[element]).forEach(function (key) {
            var elementBindings = viewModel.data[element][key];

            if (elementBindings !== undefined && _knockout.isObservable(elementBindings)) {
              elementBindings(generatedBindings[element][key]);
            } else {
              viewModel.data[element][key] = _knockout.observable(generatedBindings[element][key]);
            }
          });
        }
      };

      for (var element in generatedBindings) {
        _loop(element);
      }
    }
    /**
     * Generate binding object to be applied to master format
     *
     * This function iterates through each element defined in the content types XML and generates a nested object of
     * the associated Knockout binding data. We support 5 bindings attributes, style, css, html & tag.
     *
     * @param contentType
     * @param elements
     * @param converters
     * @param data
     */
    ;

    _proto.generateKnockoutBindings = function generateKnockoutBindings(contentType, elements, converters, data) {
      var convertedData = this.convertData(data, converters);
      var generatedData = {};

      for (var _i = 0, _Object$keys = Object.keys(elements); _i < _Object$keys.length; _i++) {
        var elementName = _Object$keys[_i];
        var elementConfig = elements[elementName];

        if (this.previousData[elementName] === undefined) {
          this.previousData[elementName] = {};
        }

        console.log(elementName, elementConfig, data, this.generateKnockoutBinding("style", elementName, elementConfig, data));
        var elementCssNames = this.generateStylesAndClassNames(contentType, elementName, elementConfig, data);
        generatedData[elementName] = {
          attributes: this.generateKnockoutBinding("attributes", elementName, elementConfig, data),
          style: this.generateKnockoutBinding("style", elementName, elementConfig, data),
          css: elementConfig.css.var in convertedData ? Object.assign(this.generateKnockoutBinding("css", elementName, elementConfig, data), {}) : {},
          html: this.generateKnockoutBinding("html", elementName, elementConfig, data)
        };

        if (elementConfig.tag !== undefined && elementConfig.tag.var !== undefined) {
          if (generatedData[elementName][elementConfig.tag.var] === undefined) {
            generatedData[elementName][elementConfig.tag.var] = "";
          }

          generatedData[elementName][elementConfig.tag.var] = convertedData[elementConfig.tag.var];
        }
      }

      return generatedData;
    }
    /**
     * Process data for elements before its converted to knockout format
     *
     * @param {object} data
     * @param {ConverterInterface[]} convertersConfig
     * @returns {object}
     */
    ;

    _proto.convertData = function convertData(data, convertersConfig) {
      for (var _iterator = convertersConfig, _isArray = Array.isArray(_iterator), _i2 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i2 >= _iterator.length) break;
          _ref = _iterator[_i2++];
        } else {
          _i2 = _iterator.next();
          if (_i2.done) break;
          _ref = _i2.value;
        }

        var converterConfig = _ref;
        this.massConverterPool.get(converterConfig.component).toDom(data, converterConfig.config);
      }

      return data;
    }
    /**
     * Generate an individual knockout binding
     *
     * @param binding
     * @param elementName
     * @param config
     * @param data
     */
    ;

    _proto.generateKnockoutBinding = function generateKnockoutBinding(binding, elementName, config, data) {
      if (config[binding] === undefined) {
        return {};
      }

      var previousData = {};

      if (this.previousData[elementName][binding] !== undefined) {
        previousData = this.previousData[elementName][binding];
      }

      if (this.bindingGenerators[binding] === undefined) {
        _consoleLogger.error("Unable to find Knockout binding generator for " + binding);

        return {};
      } // Generate the associated binding using our dedicated generators


      var generatedBindingData = this.bindingGenerators[binding](elementName, config, data, this.converterResolver, this.converterPool, previousData);
      this.previousData[elementName][binding] = generatedBindingData;
      return generatedBindingData;
    }
    /**
     * Generate all our styles and store them for rendering into <style /> block, return classes assigned to style
     * blocks
     *
     * @param contentType
     * @param elementName
     * @param config
     * @param data
     */
    ;

    _proto.generateStylesAndClassNames = function generateStylesAndClassNames(contentType, elementName, config, data) {
      var _elementCssNames;

      var className = (0, _styleRegistry.generateElementClassName)(contentType.config.name, elementName);
      var elementCssNames = (_elementCssNames = {}, _elementCssNames[className] = true, _elementCssNames[className + "-" + contentType.id] = true, _elementCssNames); // Also generate styles and store in registry to be placed into style sheet later on

      var styles = this.generateKnockoutBinding("style", elementName, config, data);
      this.styleRegistry.setStyles(className + "-" + contentType.id, styles);

      _events.trigger("styles:update", {
        className: className,
        styles: styles,
        stageId: contentType.stageId
      });

      console.log(this.styleRegistry.getAllStyles());
      return elementCssNames;
    };

    return ObservableUpdater;
  }();

  return ObservableUpdater;
});
//# sourceMappingURL=observable-updater.js.map
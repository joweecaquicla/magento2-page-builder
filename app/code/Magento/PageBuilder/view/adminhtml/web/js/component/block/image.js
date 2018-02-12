/*eslint-disable */
define(["underscore", "../config", "./block", "../../utils/url"], function (_underscore, _config, _block, _urlUtils) {
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var Image =
  /*#__PURE__*/
  function (_Block) {
    _inheritsLoose(Image, _Block);

    function Image() {
      return _Block.apply(this, arguments) || this;
    }

    var _proto = Image.prototype;

    /**
     * Get the desktop (main) image attributes for the render
     *
     * @returns {any}
     */
    _proto.getMainImageAttributes = function getMainImageAttributes() {
      var data = this.getData();

      if (data.image === "" || data.image === undefined) {
        return {};
      } else if (_underscore.isEmpty(data.image[0])) {
        return;
      }

      return {
        src: this.getImageUrl(data.image),
        alt: data.alt,
        title: data.title_tag
      };
    };
    /**
     * Get the mobile image attributes for the render
     *
     * @returns {any}
     */


    _proto.getMobileImageAttributes = function getMobileImageAttributes() {
      var data = this.getData();

      if (data.mobile_image === "" || data.mobile_image === undefined) {
        return {};
      } else if (_underscore.isEmpty(data.mobile_image[0])) {
        return;
      }

      return {
        src: this.getImageUrl(data.mobile_image),
        alt: data.alt,
        title: data.title_tag
      };
    };
    /**
     * Retrieve the image attributes
     *
     * @returns {any}
     */


    _proto.getImageLinkAttributes = function getImageLinkAttributes() {
      var data = this.getData();
      return {
        href: data.link_url || "",
        target: data.link_target || "_self",
        title: data.title_tag
      };
    };
    /**
     * Retrieve the image URL with directive
     *
     * @param {{}} image
     * @returns {string}
     */


    _proto.getImageUrl = function getImageUrl(image) {
      var imageUrl = image[0].url;

      var mediaUrl = _config.getInitConfig("media_url");

      // if imageUrl begins with forward slash, remove host
      if (_urlUtils.isPathOnly(imageUrl)) {
          mediaUrl = _urlUtils.getPathFromUrl(mediaUrl);
      }

      var mediaPath = imageUrl.split(mediaUrl);
      var directive = "{{media url=" + mediaPath[1] + "}}";
      return directive;
    };

    return Image;
  }(_block);

  return Image;
});
//# sourceMappingURL=image.js.map

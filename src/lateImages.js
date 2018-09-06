(function(root, factory) {

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['when-in-viewport'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('when-in-viewport'));
    } else {
        root.LateImage = factory(root.WhenInViewport);
    }

}(this, function(WhenInViewport) {

    function LateImage(el, options) {

        this.el = el;
        options = assign({}, LateImage.defaults, options, {context: this});

        if (options.enableViewportCheck) {

            this.inViewportListener = new WhenInViewport(el, function() {
                processImage(el, options);
            }, {threshold: options.threshold});

        } else {

            processImage(el, options);

        }

    }

    LateImage.defaults = {
        srcAttribute: 'data-src',
        altAttribute: 'data-alt',
        loadingCallback: null,
        doneCallback: null,
        failCallback: null,
        threshold: 0,
        loadingClass: 'lateImageLoading',
        loadedClass: 'lateImageLoaded',
        errorClass: 'lateImageError',
        enableViewportCheck: true
    };

    LateImage.prototype.destroy = function() {

        this.inViewportListener && this.inViewportListener.stopListening();

    };

    LateImage.registerAsJqueryPlugin = function($) {

        $.fn.lateImages = function(options) {

            return this.each(function() {
                if (!$.data(this, 'lateImage')) {
                    $.data(this, 'lateImage', new LateImage(this, options));
                }
            });

        };

    };

    function processImage(imageElement, options) {

        var imagePath = imageElement.getAttribute(options.srcAttribute);

        options.loadingCallback && options.loadingCallback(imageElement, options.context);
        toggleClass(imageElement, options.loadingClass, true);

        loadImage(imagePath, function(e) {

            imageElement.setAttribute('src', imagePath);
            toggleClass(imageElement, options.loadingClass, false);
            toggleClass(imageElement, options.loadedClass, true);

            if (imageElement.getAttribute(options.altAttribute)) {
                imageElement.setAttribute('alt', imageElement.getAttribute(options.altAttribute));
            }

            options.doneCallback && options.doneCallback(imageElement, e, options.context);

        }, function(e) {

            toggleClass(imageElement, options.loadingClass, false);
            toggleClass(imageElement, options.errorClass, true);

            options.failCallback && options.failCallback(imageElement, e, options.context);

        });

    }

    function loadImage(imagePath, doneCallback, failCallback) {

        var image = new Image();
        image.onload = doneCallback;
        image.onerror = failCallback;
        image.src = imagePath;

    }

    function assign(target) {

        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            if (source) {
                for (var key in source) {
                    if (source.hasOwnProperty(key) && typeof source[key] !== 'undefined') {
                        target[key] = source[key];
                    }
                }
            }
        }

        return target;

    }

    function each(collection, callback) {

        for (var i = 0; i < collection.length; i++) {
            callback(collection[i], i);
        }

    }

    function filter(collection) {

        var temp = [];
        each(collection, function(item) { item && temp.push(item); });
        return temp;
    }

    function toggleClass(el, classes, addClass) {

        if (LateImage.toggleClass) {
            return LateImage.toggleClass(el, classes, addClass);
        }

        var currentClasses = filter((el.className || '').split(' '));
        var userClasses = filter(classes.split(' '));
        var elClasses = [];

        each(addClass ? userClasses : currentClasses, function(className) {
            if ((addClass ? currentClasses : userClasses).indexOf(className) < 0) {
                elClasses.push(className);
            }
        });

        el.setAttribute('class', elClasses.join(' '));

    }

    var $ = window.jQuery || window.$;
    $ && LateImage.registerAsJqueryPlugin($);

    return LateImage;

}));

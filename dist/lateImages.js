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

    LateImage.useClassList = true;

    function processImage(imageElement, options) {

        var imagePath = imageElement.getAttribute(options.srcAttribute);

        options.loadingCallback && options.loadingCallback(imageElement, options.context);
        addClass(imageElement, options.loadingClass);

        loadImage(imagePath, function(e) {

            imageElement.setAttribute('src', imagePath);
            removeClass(imageElement, options.loadingClass);
            addClass(imageElement, options.loadedClass);

            if (imageElement.getAttribute(options.altAttribute)) {
                imageElement.setAttribute('alt', imageElement.getAttribute(options.altAttribute));
            }

            options.doneCallback && options.doneCallback(imageElement, e, options.context);

        }, function(e) {

            removeClass(imageElement, options.loadingClass);
            addClass(imageElement, options.errorClass);

            options.failCallback && options.failCallback(imageElement, e, options.context);

        });

    }

    function loadImage(imagePath, doneCallback, failCallback) {

        var image = new Image();
        image.onload = doneCallback;
        image.onerror = failCallback;
        image.src = imagePath;

    }

    function assign(out) {

        for (var i = 1; i < arguments.length; i++) {
            each(arguments[i], function(value, key) {
                out[key] = value;
            });
        }

        return out;

    }

    function each(collection, callback, context) {

        if (collection instanceof Array) {
            var iterations = collection.length;
            for (var i = 0; i < iterations; i++) {
                callback.call(context, collection[i], i);
            }
        } else {
            for (var key in collection) {
                collection.hasOwnProperty(key) && callback.call(context, collection[key], key);
            }
        }

    }

    function addClass(element, classesString) {

        tryClassListMethod(element, 'add', classesString, function(singleClass, currentClasses) {

            if (currentClasses.indexOf(singleClass) < 0) {
                currentClasses.push(singleClass);
                element.className = currentClasses.join(' ');
            }

        });

    }

    function removeClass(element, classesString) {

        tryClassListMethod(element, 'remove', classesString, function(singleClass, currentClasses) {

            var classPosition = currentClasses.indexOf(singleClass);
            if (classPosition >= 0) {
                currentClasses.splice(classPosition, 1);
                element.className = currentClasses.join(' ');
            }

        });

    }

    function tryClassListMethod(element, method, classesString, fallback) {

        each(getClassesArray(classesString), function(singleClass) {

            if (LateImage.useClassList && element.classList) {
                element.classList[method](singleClass);
            } else {
                fallback(singleClass, getClassesArray(element.className));
            }

        });

    }

    function getClassesArray(classesString) {

        getClassesArray.trimRE = getClassesArray.trimRE || /^\s+|\s+$/g;
        getClassesArray.spacesRE = getClassesArray.spacesRE || /\s\s+/g;
        return classesString ? classesString.replace(getClassesArray.trimRE, '').replace(getClassesArray.spacesRE, ' ').split(' ') : [];

    }

    var $ = window.jQuery || window.$;
    $ && LateImage.registerAsJqueryPlugin($);

    return LateImage;

}));

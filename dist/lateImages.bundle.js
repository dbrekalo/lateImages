(function(root, factory) {

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.WhenInViewport = factory();
    }

}(this, function() {

    var windowHeight;
    var scrollOffset;

    function WhenInViewport(element, callback, options) {

        events.setup();
        this.registryItem = registry.addItem(element, typeof callback === 'function' ? assign(options || {}, {callback: callback}) : callback);
        registry.processItem(this.registryItem);

    }

    WhenInViewport.prototype.stopListening = function() {

        registry.removeItem(this.registryItem);
        events.removeIfStoreEmpty();

    };

    WhenInViewport.defaults = {
        threshold: 0,
        context: null
    };

    assign(WhenInViewport, {

        setRateLimiter: function(rateLimiter, rateLimitDelay) {

            events.rateLimiter = rateLimiter;

            if (rateLimitDelay) {
                events.rateLimitDelay = rateLimitDelay;
            }

            return this;

        },

        checkAll: function() {

            scrollOffset = getWindowScrollOffset();
            windowHeight = getWindowHeight();

            registry.adjustPositions(registry.processItem);
            events.removeIfStoreEmpty();

            return this;

        },

        destroy: function() {

            registry.store = {};

            events.remove();
            delete events.scrollHandler;
            delete events.resizeHandler;

            return this;

        },

        registerAsJqueryPlugin: function($) {

            $.fn.whenInViewport = function(options, moreOptions) {

                var pluginOptions;
                var callbackProxy = function(callback) {
                    return function(el) { callback.call(this, $(el)); };
                };

                if (typeof options === 'function') {
                    pluginOptions = $.extend({}, moreOptions, {callback: callbackProxy(options)});
                } else {
                    pluginOptions = $.extend(options, {callback: callbackProxy(options.callback)});
                }

                return this.each(function() {

                    if (pluginOptions.setupOnce) {
                        !$.data(this, 'whenInViewport') && $.data(this, 'whenInViewport', new WhenInViewport(this, pluginOptions));
                    } else {
                        $.data(this, 'whenInViewport', new WhenInViewport(this, pluginOptions));
                    }

                });

            };

            return this;

        }

    });

    function getWindowHeight() {

        /* istanbul ignore next */
        return 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;

    }

    function getWindowScrollOffset() {

        /* istanbul ignore next */
        return 'pageYOffset' in window ? window.pageYOffset : document.documentElement.scrollTop || document.body.scrollTop;

    }

    function getElementOffset(element) {

        return element.getBoundingClientRect().top + getWindowScrollOffset();

    }

    function iterate(obj, callback, context) {

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (callback.call(context, obj[key], key) === false) {
                    break;
                }
            }
        }

    }

    function assign(out) {

        for (var i = 1; i < arguments.length; i++) {
            iterate(arguments[i], function(obj, key) {
                out[key] = obj;
            });
        }

        return out;

    }

    var registry = {

        store: {},
        counter: 0,

        addItem: function(element, options) {

            var storeKey = 'whenInViewport' + (++this.counter);
            var item = assign({}, WhenInViewport.defaults, options, {
                storeKey: storeKey,
                element: element,
                topOffset: getElementOffset(element)
            });

            return this.store[storeKey] = item;

        },

        adjustPositions: function(callback) {

            iterate(this.store, function(storeItem) {
                storeItem.topOffset = getElementOffset(storeItem.element);
                callback && callback.call(registry, storeItem);
            });

        },

        processAll: function() {

            iterate(this.store, this.processItem, this);

        },

        processItem: function(item) {

            if (scrollOffset + windowHeight >= item.topOffset - item.threshold) {

                this.removeItem(item);
                item.callback.call(item.context || window, item.element);

            }

        },

        removeItem: function(registryItem) {

            delete this.store[registryItem.storeKey];

        },

        isEmpty: function() {

            var isEmpty = true;

            iterate(this.store, function() {
                return isEmpty = false;
            });

            return isEmpty;

        }

    };

    var events = {

        setuped: false,

        rateLimiter: function(callback, timeout) {
            return callback;
        },

        rateLimitDelay: 100,

        on: function(eventName, callback) {

            /* istanbul ignore next */
            if (window.addEventListener) {
                window.addEventListener(eventName, callback, false);
            } else if (window.attachEvent) {
                window.attachEvent(eventName, callback);
            }

            return this;

        },

        off: function(eventName, callback) {

            /* istanbul ignore next */
            if (window.removeEventListener) {
                window.removeEventListener(eventName, callback, false);
            } else if (window.detachEvent) {
                window.detachEvent('on' + eventName, callback);
            }

            return this;

        },

        setup: function() {

            var self = this;

            if (!this.setuped) {

                scrollOffset = getWindowScrollOffset();
                windowHeight = getWindowHeight();

                this.scrollHandler = this.scrollHandler || this.rateLimiter(function() {

                    scrollOffset = getWindowScrollOffset();
                    registry.processAll();
                    self.removeIfStoreEmpty();

                }, this.rateLimitDelay);

                this.resizeHandler = this.resizeHandler || this.rateLimiter(function() {

                    windowHeight = getWindowHeight();
                    registry.adjustPositions(registry.processItem);
                    self.removeIfStoreEmpty();

                }, this.rateLimitDelay);

                this.on('scroll', this.scrollHandler).on('resize', this.resizeHandler);

                this.setuped = true;

            }

        },

        removeIfStoreEmpty: function() {

            registry.isEmpty() && this.remove();

        },

        remove: function() {

            if (this.setuped) {
                this.off('scroll', this.scrollHandler).off('resize', this.resizeHandler);
                this.setuped = false;
            }

        }

    };

    var $ = window.jQuery || window.$;
    $ && WhenInViewport.registerAsJqueryPlugin($);

    return WhenInViewport;

}));

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

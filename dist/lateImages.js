;(function($){

	function loadImage(src, doneCallback, failCallback){

        $('<img src="'+ src +'">').load(doneCallback).error(failCallback);

    }

	function LateImages(el, options){

		this.$el = $(el);
		this.options = $.extend({}, $.lateImages.defaults, options);
		this.init();

	}

	$.extend(LateImages.prototype,{

		init: function(){

			if (this.options.enableViewportCheck) {

				this.$el.whenInViewport(this.processImage, {
					context: this,
					threshold: this.options.threshold
				});

			} else {

				this.processImage();

			}

		},

		processImage: function(){

			this.options.beforeProcessImage && this.options.beforeProcessImage(this.$el, this);

			var $el = this.$el,
				options = this.options,
				src = $el.attr(options.srcAttribute),
				alt = $el.attr(options.altAttribute),
				self = this;

			$el.addClass(options.loadingClass);

			loadImage(src, function(e){

				!$el.is('img') && self.$el.replaceWith($el = $(new Image()));

				$el.attr('src', src).removeClass(options.loadingClass).addClass(options.loadedClass);
				alt && $el.attr('alt', alt);
				options.doneCallback && options.doneCallback($el, e, self);

			}, function(e){

				$el.removeClass(options.loadingClass).addClass(options.errorClass);
				options.failCallback && options.failCallback($el, e, self);

			});

		}

	});

	$.lateImages = LateImages;

	$.lateImages.defaults = {
		'srcAttribute': 'data-src',
		'altAttribute': 'data-alt',

		'beforeProcessImage': null,
		'doneCallback': null,
		'failCallback': null,

		'threshold': 0,

		'loadingClass': 'lateImageLoading',
		'loadedClass': 'lateImageLoaded',
		'errorClass': 'lateImageError',

		'enableViewportCheck': true
	};

	$.fn.lateImages = function(options) {

		return this.each(function() {
			if (!$.data(this, 'lateImages')) {
				$.data(this, 'lateImages', new LateImages(this, options));
			}
		});

	};

})(window.jQuery || window.Zepto);
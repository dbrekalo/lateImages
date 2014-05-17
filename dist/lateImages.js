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

			this.$el.whenInViewport(this.processImage, {
				context: this,
				threshold: this.options.threshold
			});

		},

		processImage: function(){

			var $el = this.$el,
				options = this.options,
				src = $el.attr(options.srcAttribute),
				alt = $el.attr(options.altAttribute),
				self = this;

			$el.addClass(options.loadingClass);

			loadImage(src, function(){

				!$el.is('img') && self.$el.replaceWith($el = $(new Image()));

				$el.attr('src', src).removeClass(options.loadingClass).addClass(options.loadedClass);
				alt && $el.attr('alt', alt);
				options.doneCallback && options.doneCallback($el);

			}, function(){

				$el.removeClass(options.loadingClass).addClass(options.errorClass);
				options.failCallback && options.failCallback($el);

			});

		}

	});

	$.lateImages = LateImages;

	$.lateImages.defaults = {
		'srcAttribute': 'data-src',
		'altAttribute': 'data-alt',

		'doneCallback': null,
		'failCallback': null,

		'threshold': 0,

		'loadingClass': 'lateImageLoading',
		'loadedClass': 'lateImageLoaded',
		'errorClass': 'lateImageError'
	};

	$.fn.lateImages = function(options) {

		return this.each(function() {
			if (!$.data(this, 'lateImages')) {
				$.data(this, 'lateImages', new LateImages(this, options));
			}
		});

	};

})(window.jQuery || window.Zepto);
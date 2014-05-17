#Late images
Delay loading of images until they enter viewport with lightweight plugin for jQuery

##Basic usage
```javascript
$('.lateImages').lateImages();

$('.lateImages').lateImages({
	'srcAttribute': 'data-late-src',
	'altAttribute': 'alt',
	'threshold': 200
});
```
##Options
Configure plugin with following defaults / options:

```javascript
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
```


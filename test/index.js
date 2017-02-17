var assert = require('chai').assert;
var $ = window.$ = require('jquery');
var LateImage = require('../');

var imagePath = '/test/images/';
var windowHeight;

var testImageElement;
var anotherTestImageElement;

beforeEach(function() {

    windowHeight = window.innerHeight;
    window.scrollTo(0, 0);

    $('body').css({
        height: '10000px',
        margin: 0,
        padding: 0
    }).html('').append(
        '<div style="height: ' + 2 * windowHeight + 'px;"></div>' +
        '<img id="lateImage" data-src="' + imagePath + '1.jpg" data-alternate-src="' + imagePath + '1alt.jpg" data-alt-text="Test alt" />' +
        '<img class=" class1   class2 " id="anotherLateImage" data-src="' + imagePath + '/uknown.jpg" data-alt="Test alt" />'
    );

    testImageElement = document.getElementById('lateImage');
    anotherTestImageElement = document.getElementById('anotherLateImage');

});

describe('Late image', function() {

    it('loads image when in viewport', function(done) {

        var imageLoaded = false;

        new LateImage(testImageElement, {
            doneCallback: function() {
                imageLoaded = true;
            }
        });

        window.scrollTo(0, 2 * windowHeight);

        setTimeout(function() {
            assert.isTrue(imageLoaded);
            done();
        }, 100);

    });

    it('will not load images outside viewport', function(done) {

        var imageLoaded = false;

        new LateImage(testImageElement, {
            doneCallback: function() {
                imageLoaded = true;
            }
        });

        window.scrollTo(0, windowHeight / 10);

        setTimeout(function() {
            assert.isFalse(imageLoaded);
            done();
        }, 100);

    });

    it('fails when image cannot be loaded', function(done) {

        var imageWasLoading = false;
        var imageFailed = false;

        new LateImage(anotherTestImageElement, {
            loadingCallback: function() {
                imageWasLoading = true;
            },
            failCallback: function() {
                imageFailed = true;
            }
        });

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {
            assert.isTrue(imageWasLoading && imageFailed);
            done();
        }, 100);

    });

    it('skips viewport check when instructed to', function(done) {

        var imageLoaded = false;

        new LateImage(testImageElement, {
            doneCallback: function(element) {
                imageLoaded = true;
            },
            enableViewportCheck: false
        });

        setTimeout(function() {
            assert.isTrue(imageLoaded);
            done();
        }, 100);

    });

    it('will set alt and src source attributes as defined in options', function(done) {

        new LateImage(testImageElement, {
            srcAttribute: 'data-alternate-src',
            altAttribute: 'data-alt-text'
        });

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {
            assert.strictEqual(testImageElement.getAttribute('src'), testImageElement.getAttribute('data-alternate-src'));
            assert.strictEqual(testImageElement.getAttribute('alt'), testImageElement.getAttribute('data-alt-text'));
            done();
        }, 200);

    });

    it('removes when in viewport listener when destroy is called', function(done) {

        var imageLoaded = false;

        var lateImage = new LateImage(testImageElement, {
            doneCallback: function() { imageLoaded = true; }
        });

        lateImage.destroy();

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {
            assert.isFalse(imageLoaded);
            done();
        }, 200);

    });

    it('manipulates class attributes correctly with classList', function(done) {

        new LateImage(testImageElement, {
            loadedClass: 'loaded'
        });

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {
            assert.isTrue(testImageElement.classList.contains('loaded'));
            done();
        }, 200);

    });

    it('manipulates class attributes correctly when classList is not supported', function(done) {

        LateImage.useClassList = false;

        new LateImage(testImageElement, {
            loadedClass: 'loaded'
        });

        new LateImage(anotherTestImageElement, {
            errorClass: ' loadError    class1 class2 ',
        });

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {
            assert.isTrue(testImageElement.className === 'loaded');
            assert.isTrue(anotherTestImageElement.className === 'class1 class2 loadError');
            LateImage.useClassList = true;
            done();
        }, 200);

    });

    it('works correctly when called through jquery plugin facade', function(done) {

        var lateImage = $(testImageElement).lateImages({
            doneCallback: function(el) {
                $(el).addClass('loadedViaJquery');
            }
        }).data('lateImage');

        assert.instanceOf(lateImage, LateImage);

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {
            assert.isTrue($(testImageElement).hasClass('loadedViaJquery'));
            done();
        }, 200);

    });

});

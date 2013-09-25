'use strict';

var browserify = require('browserify'),
		fs = require('fs'),
		MangleStream = require('mangle-stream');

var bundleStream = browserify('./zclip').bundle({
	standalone: false,
});

bundleStream.pipe(fs.createWriteStream('dist/zclip.js'));
bundleStream.pipe(new MangleStream()).pipe(fs.createWriteStream('dist/zclip.min.js'));

fs.createReadStream('./node_modules/zeroclipboard/ZeroClipboard.swf')
		.pipe(fs.createWriteStream('./dist/ZeroClipboard.swf'));

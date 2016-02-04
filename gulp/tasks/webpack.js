var webpack = require('webpack');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var config = require('../config').webpack;

gulp.task('webpack', function (callback) {
	webpack(config, function (err, stats) {
		if (err) {
			throw new gutil.PluginError("webpack", err);
		}
    gutil.log("[webpack]", stats.toString());
	});
});

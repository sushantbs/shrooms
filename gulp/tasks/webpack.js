var webpack = require('webpack');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var _ = require('myx-lib/underscore');
var config = require('../config').webpack;

gulp.task('webpack', function (callback) {
	webpack(config, function (err, stats) {
		if (err) {
			throw new gutil.PluginError("webpack", err);
		}
        gutil.log("[webpack]", stats.toString());

        // gutil.log("[fonts]", "Starting...");
       //  fs.readdir('./src/assets/fonts', function (err, files) {
       //  	_.each(files, function (fileName) {

       //  		if (/(woff)$/.test(fileName)) {
			    //    	var writeFileName = path.join('./build/', fileName),
			    //    		readFileName = path.join('./src/assets/fonts/', fileName);

			    //    	fs.writeFile(writeFileName, fs.readFileSync(readFileName));
			    // }
       //  	});
       //  	gutil.log("[fonts]", "Completed");
       //  });
	});
});

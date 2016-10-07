// This file is in charge of the build process:
// Running tests, checking code quality, minifying the code, etc.

'use strict';

// Include gulp
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');


/*
 * QUALITY tasks.
 */
gulp.task('lint', function() {
  var jshint = require('gulp-jshint');
  var gjslint = require('gulp-gjslint');

  // 80 characters per line is too restrictive!
  var lintOptions = {
    flags: ['--nojsdoc', '--max_line_length 150', '--custom_jsdoc_tags "property, callback"']
  };

  return gulp.src(['./lib/*.js', './test/*.js', './gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gjslint(lintOptions))
    .pipe(gjslint.reporter('console'));
});


/*
 * Tasks for UNIT tests.
 */
gulp.task('pre-test', function() {

  gulp.src(['./lib/*.js'])
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});


gulp.task('test', ['pre-test'], function(done) {
  var mocha = require('gulp-mocha');

  gulp.src('./test/*.js')
  .pipe(mocha({reporter: 'spec'}))
  .pipe(istanbul.writeReports())
  .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 }}));
});


/*
 * RELEASE "tasks".
 *
 * Note: we use the "gulp release approach":
 *
 * 1. Create a tag based on current version specified in package.json
 * 2. Publish the project to NPM repository.
 * 3. Bump the version of package.json, bower.json or/and manifest.json.
 * 4. Commit and push to Github.
 */
require('gulp-release-it')(gulp);

# Angular-Translate Quality

[![Build Status](https://travis-ci.org/linagora/angular-translate-quality.svg?branch=master)](https://travis-ci.org/linagora/angular-translate-quality)
[![Coverage Status](https://coveralls.io/repos/github/linagora/angular-translate-quality/badge.svg?branch=master)](https://coveralls.io/github/linagora/angular-translate-quality?branch=master)
[![NPM](https://img.shields.io/badge/download-NPM-blue.svg)](https://www.npmjs.com/package/angular-translate-quality)

This library allows to verify the correctness of angular-translate elements.  
Angular-translate is an Angular library to manage internationalization through JSon
files and keys in HTML views. Each language is managed in its own JSon file.

This library allows to check that...

* ... a key is declared only once in a JSon file (no duplicate).
* ... a key is declared in upper case.
* ... there is no trailing space in the JSon files (reduce the size).
* ... keys are sorted alphabetically (ease the search for a specific key).
* ... values that contain HTML mark-ups are closed correctly.
* ... all the JSon files have the same keys (no missing key).
* ... all the equivalent values (across all the JSon files) have the same number of HTML mark-ups.
* ... all the HTML files reference a key that was declared in the JSon files.
* ... no HTML file mixes the *translate* directive and the *translate* filter.

This library does not support...

* ... keys declared in Javascript code (only in JSon files).
* ... namespaces in JSon files (at least, not for the moment).


## Options

* **options.loc_i18n**: the location of the JSon files. Default is `./src/i18n/`.
* **options.loc_html**: the location of the JSon files. Default is `./src/**/`.
* **cb**: a callback function to handle error messages. Default is `console.log`.


## Usage

Add the dependency in your file.

```
npm install angular-translate-quality --save-dev
```

```js
var qual = require('angular-translate-quality');
var valid = qual.validate();
```

... or with other options...

```js
var qual = require('angular-translate-quality');

function cb(msg) {
  console.log(msg);
}

var valid = qual.validate({
  loc_i18n: './i18n/**/',
  loc_html: './html/**/',
  cb: cb
});
```


## Example with Gulp

```js
var qual = require('angular-translate-quality');
var gutil = require('gulp-util');

gulp.task('check_i18n', function() {

  var res = qual.validate();
  if (! res) {
    throw new gutil.PluginError({
      plugin: 'check_i18n',
      message: 'Errors were found about internationalization.'
    });
  }
});
```

To run checks then, just execute **gulp check_i18n**.


## License

This package is licensed under the terms of the MIT license.


## Changing the Version

Simply update the version in the **package.json** file.  
Then, commit and push your change to the Git repository, before running the release command.


## Developers

* Initialize: `npm install`
* Test: `gulp test`
* Send coverage report to Coveralls: `gulp coveralls` 
* Lint check: `gulp lint`
* [Release](https://www.npmjs.com/~linagora): `gulp complete-release`
* [Local build](http://podefr.tumblr.com/post/30488475488/locally-test-your-npm-modules-without-publishing): `npm pack`

For Linagora folks, releases to [our NPM repository](https://www.npmjs.com/~linagora) are managed through our Jenkins server.  
Please, log into it and run the **angular-translate-quality-release** job.

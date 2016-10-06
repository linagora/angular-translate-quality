# Angular-Translate-Quality

[![Build Status](https://travis-ci.org/linagora/angular-translate-quality.svg?branch=master)](https://travis-ci.org/linagora/angular-translate-quality)
[![Coverage Status](https://coveralls.io/repos/linagora/angular-translate-quality/badge.svg?branch=master&service=github)](https://coveralls.io/github/linagora/angular-translate-quality?branch=master)

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


## Options

* **options.loc_i18n**: the location of the JSon files. Default is `./src/i18n/`.
* **options.loc_html**: the location of the JSon files. Default is `./src/**/`.
* **cb**: a callback function to handle an error message.


## Usage

Add the dependency in your file.

```
npm install angular-translate-quality --save-dev
```

```js
var qual = require('angular-translate-quality');
qual.validate();
```

... or with other options...

```js
var qual = require('angular-translate-quality');

function cb(msg) {
  console.log(msg);
}

qual.validate( {
  loc_i18n: './i18n/',
  loc_html: './html/',
  cb: cb
});
```


## Example with Gulp

```js
var qual = require('angular-translate-quality');
gulp.task('check_i18n', qual.validate);
```

To run checks then, just execute **gulp check_i18n**.


## License

This package is licensed under the terms of the MIT license.

# Angular-Translate Quality

[![Build Status](https://travis-ci.org/linagora/angular-translate-quality.svg?branch=master)](https://travis-ci.org/linagora/angular-translate-quality)
[![Coverage Status](https://coveralls.io/repos/github/linagora/angular-translate-quality/badge.svg?branch=master)](https://coveralls.io/github/linagora/angular-translate-quality?branch=master)
[![NPM](https://img.shields.io/badge/download-NPM-blue.svg)](https://www.npmjs.com/package/angular-translate-quality)

This library allows to verify the correctness of angular-translate elements.  
[Angular-translate](https://github.com/angular-translate/angular-translate) is an Angular library to manage internationalization through JSon
files and keys in HTML views. Each language is managed in its own JSon file.

This library allows to check that...

* ... a key is declared only once in a JSon file (no duplicate).
* ... a key is declared in upper case.
* ... there is no trailing space in the JSon files (reduce the size).
* ... keys are sorted alphabetically (ease the search for a specific key).
* ... values that contain HTML mark-ups are closed correctly.
* ... values do not contain forbidden patterns (to ban words, check typography, etc).
* ... values are trimmed (no white space character at the beginning or the end).
* ... all the JSon files have the same keys (no missing key).
* ... all the equivalent values (across all the JSon files) have the same number of HTML mark-ups.
* ... all the HTML files reference a key that was declared in the JSon files.
* ... no HTML file mixes the *translate* directive and the *translate* filter.
* ... all the **alt** and **title** attributes are translated in HTML files.
* ... all the mark-ups texts are translated in HTML files.
* ... all the Angular texts (`{{ 'some text' }}`) are translated in HTML files.
* ... all the i18n keys are used somewhere in the HTML files.
* ... all the translate filters are well-formed (e.g. no {{ KEY_WITHOUT_QUOTES | translate }}).

This library does not support...

* ... keys declared in Javascript code (only in JSon files).
* ... namespaces in JSon files (at least, not for the moment).


## Options

* **options.loc_i18n**: the location of the JSon files. Default is `./src/i18n/`.
* **options.loc_html**: the location of the JSon files. Default is `./src/**/`.
* **options.cb**: a callback function to handle error messages. Default is `console.log`.
* **options.fail_on_warning**: whether the result should be marked as invalid when warnings are found. Default is `false`.
* **options.exclusions**: a list of (entire) strings that should be considered as not translatable.
* **options.forbidden_patterns**: a set of forbidden patterns in values. Default is `{}`.
* **options.external_keys_cb**: a callback function to handle errors related to external keys. No default value.
* **options.check_html**: `true` to search non-translated text in HTML mark-ups and attributes,
as well as in Angular texts (`{{ 'some text' }}`). Default is `true`. All the mark-ups are verified.
About attributes, only **alt** and **title** are verified.


## Usage

Add the dependency in your file...

```
npm install angular-translate-quality --save-dev
```

... and use it...

```js
var qual = require('angular-translate-quality');
var valid = qual.validate();
```

... or with your own custom options...

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


## Forbidden Patterns

Forbidden patterns is an option to ban words or verify typography in translated text (values in JSon files).  
Each JSon file can have its own patterns.

In this example, we assume we have **en.json**, **fr.json** and **it.json** files.  
We only define forbidden patterns in **en.json** and **fr.json**.

```js
var options = {
      forbidden_patterns: {}
};

options.forbidden_patterns.en = [
  {regex: '\\s+[,.;:?!]', msg: '[EN] All the punctuation marks refuse any preceding white space character.'},
  {regex: 'banned', sensitive: true, msg: '"banned" is a forbidden key word.'}
];

options.forbidden_patterns.fr = [
  {regex: '\\s,', msg: 'Une virgule s\'écrit sans espace avant.'},
  {regex: ',([^ ]| {2,})', msg: 'Une virgule s\'écrit avec un seul espace après.'},
  {regex: '^[a-z]', sensitive: true, msg: 'A sentence starts with an upper-case letter.'}
];
```

The structure of this option is the following.

* Object keys: name of a JSon file, without the *.json* extension. `en.json` => `en`
* Object values: array of objects.

Each object has the following properties.

* **regex**: a regular expression that should output an error when found.
* **sensitive**: true if the pattern search should be case-sensitive (default: false, i.e. case insensitive).
* **msg**: the message to display when the regular expression was found in a value.


## Exclusions for Non-Translated Text

When checking HTML files, mark-ups and some attributes (**alt**, **title**) are verified.  
Angular-translate elements are removed from the text during the check. If the result is not empty
(or only made up of white spaces), an error is returned. Notice that HTML entities (e.g. `&raquo;`) are
also skipped from the check. It is possible to add exclusions too. Thus...

```html
<img src="" alt="..." />
```

... can be made valid by using the exclusions option.

```js
var options = {
      exclusions: ['...'] 
};
```


## Handling Not Found Keys

When **options.check_html** is true, this library searches for keys that re not used anywhere in HTML files.
However, it is possible that keys are used in JS files instead of HTML ones. Let's consider the following example.

HTML view:

```html
<p>{{ formatStatus( node ) | translate }}</p>
```

JS controller:

```js
$scope.formatStatus = formatStatus;

function formatStatus( node ) {
  // Find the right i18n key
  return KEY;
}
```

Basically, the translation key is dynamically deduced by a controller function.  
So, the key(s) will not be found in HTML files but in the JS file. Therefore, we do not want any warning here.

To deal with such situations, we can use the **options.external_keys_cb** option.  
This option points to a callback function that takes the error callback (**options.cb**) and an array of the keys that
were not found. This callback must return **false** to consider the messages as warnings, **true** to mark the validation as invalid.

It is a way to filter warnings.

```js
$options.external_keys_cb = function(errorCallback, notFoundKeys) {
  notFoundKeys.forEach(function(key) {
    
    // Manual check or read some file...
    // If not found, add an error message.
    errorCallback('Key ' + key + ' was not found anywhere.');
  });

  // Consider these errors as warnings => return false.
  return false;
}
```

The warnings returned by this callback function will replace those that would have been emitted by default for
not found keys.


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

## Example with Grunt

```js
var quality = require('angular-translate-quality');

grunt.registerTask('check_i18n', function() {

    logfile(grunt, { filePath: 'i18n_errors.log', clearLogFile: true });

    var options = {
        forbidden_patterns: {}
    };

    options.forbidden_patterns.en = [
        {regex: '[()]+', msg: '[ WARNING ] "()" is a forbidden character.'},
        {regex: '[:]+', msg: '[ WARNING ] ":" is a forbidden character.'}
    ];

    options.forbidden_patterns.es = [
        {regex: '[()]+', msg: '[ WARNING ] "()" is a forbidden character.'},
        {regex: '[:]+', msg: '[ WARNING ] ":" is a forbidden character.'}
    ];

    var valid = quality.validate({
        loc_i18n: './i18n/translation/**/',
        loc_i18n_ignored: './i18n/translation/tmp/',
        loc_html: './views/**/',
        fail_on_warning: false,
        check_html: false,
        forbidden_patterns: options.forbidden_patterns,
        verify_i18n_in_ignored_code: true
    });

    if (! valid) {
        throw grunt.util.error('Errors were found about internationalization.');
    }

});
```

To run checks then, execute **grunt --base C:\Users\sdura\IdeaProjects\teamserver\src\main\angular --gruntfile C:\Users\sdura\IdeaProjects\teamserver\src\main\angular\GruntfileWindows.js check_i18n --force**.

## License

This package is licensed under the terms of the MIT license.


## Changing the Version

Simply update the version in the **package.json** file.  
Then, commit and push your change to the Git repository, before running the release command.


## Developers

* Fork TS Version was available following next tutorial: https://coderwall.com/p/q_gh-w/fork-and-patch-npm-moduels-hosted-on-github
* Run: npm install angular-translate-quality --save-dev , in order to get the latest version.
* Initialize: `npm install`
* Test: `gulp test`
* Send coverage report to Coveralls: `gulp coveralls` 
* Lint check: `gulp lint`
* [Release](https://www.npmjs.com/~linagora): `gulp complete-release`
* [Local build](http://podefr.tumblr.com/post/30488475488/locally-test-your-npm-modules-without-publishing): `npm pack`

For Linagora folks, releases to [our NPM repository](https://www.npmjs.com/~linagora) are managed through our Jenkins server.  
Please, log into it and run the **angular-translate-quality-release** job.

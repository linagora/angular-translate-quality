'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var qual = require('../lib/index.js');


describe('Validation on real projects', function() {

  var errors = [];
  var cb = function(msg) {
    errors.push(msg);
  };

  beforeEach(function() {
    errors.length = 0;
  });


  it('should detect missing keys', function() {

    var options = {
      loc_i18n: __dirname + '/resources/missing_keys',
      loc_html: __dirname + '/resources/missing_keys',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, false);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], 'Key present in en.json is missing in fr.json. Key: KEY_2');
    assert.equal(errors[1], 'Extra key present in fr.json. It was not found in en.json. Key: KEY_5');
  });


  it('should validate files with the same keys', function() {

    var options = {
      loc_i18n: __dirname + '/resources/same_keys',
      loc_html: __dirname + '/resources/same_keys',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 0);
  });


  it('should detect when values do not have the same number of mark-ups', function() {

    var options = {
      loc_i18n: __dirname + '/resources/same_keys_different_markups',
      loc_html: __dirname + '/resources/same_keys_different_markups',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, false);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], 'A mark-up was expected for KEY_2 in fr.json. See en.json. Mark-up: strong');
    assert.equal(errors[1], 'A mark-up was found for KEY_3 in fr.json but it was not found in en.json. Mark-up: strong');
  });


  it('should detect when the HTML views mix « translate » directives and filters', function() {

    var options = {
      loc_i18n: __dirname + '/resources/same_keys_with_confused_html',
      loc_html: __dirname + '/resources/same_keys_with_confused_html',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, false);
    assert.equal(errors.length, 3);
    assert.equal(errors[0], 'Do NOT mix the translate directive and the translate filter. File in error: view_fail_1.html');
    assert.equal(errors[1], 'Do NOT mix the translate directive and the translate filter. File in error: view_fail_2.html');
    assert.equal(errors[2], 'Do NOT mix the translate directive and the translate filter. File in error: view_fail_3.html');
  });


  it('should detect when HTML views reference invalid keys', function() {

    var options = {
      loc_i18n: __dirname + '/resources/same_keys_with_html_and_invalid_references',
      loc_html: __dirname + '/resources/same_keys_with_html_and_invalid_references',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, false);
    assert.equal(errors.length, 3);
    assert.equal(errors[0], 'An unknown i18n key is referenced in view.html. Key name: KEY_54');
    assert.equal(errors[1], 'An unknown i18n key is referenced in view.html. Key name: MY_KEY');
    assert.equal(errors[2], 'An unknown i18n key is referenced in view.html. Key name: MY_OTHER_KEY');
  });


  it('should detect invalid key definitions', function() {

    var options = {
      loc_i18n: __dirname + '/resources/invalid_key_definitions',
      loc_html: __dirname + '/resources/invalid_key_definitions',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, false);
    assert.equal(errors.length, 2);
    assert.include(errors[0], 'i18n keys must all be in upper case (with only letters, numbers and underscores). Key: inv_key');
    assert.include(errors[1], 'i18n keys must be sorted alphabetically. Key KEY_4 breaks this rule.');
  });


  it('should validate a valid project', function() {

    var options = {
      loc_i18n: __dirname + '/resources/all_valid',
      loc_html: __dirname + '/resources/all_valid',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 0);
  });


  it('should find non-translated ALT attributes in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_alt',
      loc_html: __dirname + '/resources/html_alt',
      cb: cb,
      check_html: true
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], '[ WARNING ] Non-translated text in view.html: alt="this was not translated"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text in view.html: aLT="this was not translated too"');
  });


  it('should consider exclusions while searching non-translated ALT attributes in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_alt',
      loc_html: __dirname + '/resources/html_alt',
      cb: cb,
      check_html: true,
      exclusions: ['this was not translated']
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 1);
    assert.equal(errors[0], '[ WARNING ] Non-translated text in view.html: aLT="this was not translated too"');
  });


  it('should find non-translated TITLE attributes in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_title',
      loc_html: __dirname + '/resources/html_title',
      cb: cb,
      check_html: true
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 4);
    assert.equal(errors[0], '[ WARNING ] Non-translated text in view.html: alt="this was not translated"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text in view.html: title="todo"');
    assert.equal(errors[2], '[ WARNING ] Non-translated text in view.html: TITLE="todo 2"');
    assert.equal(errors[3], '[ WARNING ] Non-translated text in view.html: title="{{ \'KEY_2\' | translate }} not totally translated"');
  });


  it('should consider exclusions while searching non-translated TITLE attributes in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_title',
      loc_html: __dirname + '/resources/html_title',
      cb: cb,
      check_html: true,
      exclusions: ['todo 2']
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 3);
    assert.equal(errors[0], '[ WARNING ] Non-translated text in view.html: alt="this was not translated"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text in view.html: title="todo"');
    assert.equal(errors[2], '[ WARNING ] Non-translated text in view.html: title="{{ \'KEY_2\' | translate }} not totally translated"');
  });


  it('should find non-translated text between mark-ups in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_markups',
      loc_html: __dirname + '/resources/html_markups',
      cb: cb,
      check_html: true
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 3);
    assert.equal(errors[0], '[ WARNING ] Non-translated text between mark-ups in view.html: "This is not translated. {{ \'KEY_1\' | translate }}"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text between mark-ups in view.html: "Not done yet"');
    assert.equal(errors[2], '[ WARNING ] Non-translated text between mark-ups in view.html: "This either"');
  });


  it('should consider exclusions while searching non-translated text between mark-ups in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_markups',
      loc_html: __dirname + '/resources/html_markups',
      cb: cb,
      check_html: true,
      exclusions: ['This either', 'Not done yet']
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 1);
    assert.equal(errors[0], '[ WARNING ] Non-translated text between mark-ups in view.html: "This is not translated. {{ \'KEY_1\' | translate }}"');
  });


  it('should find keys that are not used in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/keys_are_not_used',
      loc_html: __dirname + '/resources/keys_are_not_used',
      cb: cb,
      check_html: true
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], '[ WARNING ] Key KEY_2 is not used in any HTML file.');
    assert.equal(errors[1], '[ WARNING ] Key KEY_4 is not used in any HTML file.');
  });


  it('should find non-translated Angular text in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_angular_text',
      loc_html: __dirname + '/resources/html_angular_text',
      cb: cb,
      check_html: true
    };

    var result = qual.validate(options);
    assert.equal(result, true);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], '[ WARNING ] Non-translated text might have been forgotten in view.html: "KEY_2"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text might have been forgotten in view.html: "This either"');
  });


  it('should find forbidden patterns in values', function() {

    var options = {
      loc_i18n: __dirname + '/resources/forbidden_patterns',
      loc_html: __dirname + '/resources/forbidden_patterns',
      cb: cb,
      forbidden_patterns: {}
    };

    // Make options readable.
    // Nothing for the "it.json" file.
    options.forbidden_patterns.en = [
      {regex: '\\s+:', msg: 'Colons cannot be preceded by a white space character.'},
      {regex: 'banned', sensitive: true, msg: '"banned" is a forbidden key word.'}
    ];

    options.forbidden_patterns.fr = [
      {regex: '\\s,', msg: 'Une virgule s\'écrit sans espace avant.'},
      {regex: ',([^ ]| {2,})', msg: 'Une virgule s\'écrit avec un seul espace après.'},
      {regex: '^[a-z]', sensitive: true, msg: 'Une phrase commence avec une majuscule.'}
    ];

    var result = qual.validate(options);
    assert.equal(result, false);
    assert.equal(errors.length, 7);
    assert.equal(errors[0], '3: Colons cannot be preceded by a white space character.');
    assert.equal(errors[1], '4: Colons cannot be preceded by a white space character.');
    assert.equal(errors[2], '5: "banned" is a forbidden key word.');
    assert.equal(errors[3], '3: Une virgule s\'écrit sans espace avant.');
    assert.equal(errors[4], '3: Une virgule s\'écrit avec un seul espace après.');
    assert.equal(errors[5], '4: Une phrase commence avec une majuscule.');
    assert.equal(errors[6], '5: Une virgule s\'écrit avec un seul espace après.');
  });


  it('should detect malformed filters', function() {

    var options = {
      loc_i18n: __dirname + '/resources/malformed_filter',
      loc_html: __dirname + '/resources/malformed_filter',
      cb: cb
    };

    var result = qual.validate(options);
    assert.equal(result, false);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], 'Malformed declaration with the translate filter in view.html. The key must be surrounded with quotes. Key name: KEY_1');
    assert.equal(errors[1], 'Malformed declaration with the translate filter in view.html. The key must be surrounded with quotes. Key name: KEY_2');
  });
});

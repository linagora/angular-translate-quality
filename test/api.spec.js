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

    qual.validate(options);
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

    qual.validate(options);
    assert.equal(errors.length, 0);
  });


  it('should detect when values do not have the same number of mark-ups', function() {

    var options = {
      loc_i18n: __dirname + '/resources/same_keys_different_markups',
      loc_html: __dirname + '/resources/same_keys_different_markups',
      cb: cb
    };

    qual.validate(options);
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

    qual.validate(options);
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

    qual.validate(options);
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

    qual.validate(options);
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

    qual.validate(options);
    assert.equal(errors.length, 0);
  });


  it('should find non-translated ALT attributes in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_alt',
      loc_html: __dirname + '/resources/html_alt',
      cb: cb,
      check_html: true
    };

    qual.validate(options);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], '[ WARNING ] Non-translated text in view.html: alt="this was not translated"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text in view.html: aLT="this was not translated too"');
  });


  it('should find non-translated TITLE attributes in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_title',
      loc_html: __dirname + '/resources/html_title',
      cb: cb,
      check_html: true
    };

    qual.validate(options);
    assert.equal(errors.length, 4);
    assert.equal(errors[0], '[ WARNING ] Non-translated text in view.html: alt="this was not translated"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text in view.html: title="todo"');
    assert.equal(errors[2], '[ WARNING ] Non-translated text in view.html: TITLE="todo 2"');
    assert.equal(errors[3], '[ WARNING ] Non-translated text in view.html: title="{{ \'KEY_2\' | translate }} not totally translated"');
  });
  
  
  it('should find non-translated text between mark-ups in HTML files', function() {

    var options = {
      loc_i18n: __dirname + '/resources/html_markups',
      loc_html: __dirname + '/resources/html_markups',
      cb: cb,
      check_html: true
    };

    qual.validate(options);
    assert.equal(errors.length, 3);
    assert.equal(errors[0], '[ WARNING ] Non-translated text between mark-ups in view.html: "This is not translated. {{ \'KEY_1\' | translate }}"');
    assert.equal(errors[1], '[ WARNING ] Non-translated text between mark-ups in view.html: "Not done yet"');
    assert.equal(errors[2], '[ WARNING ] Non-translated text between mark-ups in view.html: "This either"');
  });
});

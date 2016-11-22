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
    assert.notEqual(errors[0].indexOf('Key present in en.json is missing in fr.json. Key: KEY_2'), -1);
    assert.notEqual(errors[1].indexOf('Extra key present in fr.json. It was not found in en.json. Key: KEY_5'), -1);
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
    assert.notEqual(errors[0].indexOf('A mark-up was expected for KEY_2 in fr.json. See en.json. Mark-up: strong'), -1);
    assert.notEqual(errors[1].indexOf('A mark-up was found for KEY_3 in fr.json but it was not found in en.json. Mark-up: strong'), -1);
  });


  it('should detect when the HTML views mix « translate » directives and filters', function() {

    var options = {
      loc_i18n: __dirname + '/resources/same_keys_with_confused_html',
      loc_html: __dirname + '/resources/same_keys_with_confused_html',
      cb: cb
    };

    qual.validate(options);
    assert.equal(errors.length, 3);
    assert.notEqual(errors[0].indexOf('Do NOT mix the translate directive and the translate filter. File in error: view_fail_1.html'), -1);
    assert.notEqual(errors[1].indexOf('Do NOT mix the translate directive and the translate filter. File in error: view_fail_2.html'), -1);
    assert.notEqual(errors[2].indexOf('Do NOT mix the translate directive and the translate filter. File in error: view_fail_3.html'), -1);
  });


  it('should detect when HTML views reference invalid keys', function() {

    var options = {
      loc_i18n: __dirname + '/resources/same_keys_with_html_and_invalid_references',
      loc_html: __dirname + '/resources/same_keys_with_html_and_invalid_references',
      cb: cb
    };

    qual.validate(options);
    assert.equal(errors.length, 3);
    assert.notEqual(errors[0].indexOf('An unknown i18n key is referenced in view.html. Key name: KEY_54'), -1);
    assert.notEqual(errors[1].indexOf('An unknown i18n key is referenced in view.html. Key name: MY_KEY'), -1);
    assert.notEqual(errors[2].indexOf('An unknown i18n key is referenced in view.html. Key name: MY_OTHER_KEY'), -1);
  });


  it('should detect invalid key definitions', function() {

    var options = {
      loc_i18n: __dirname + '/resources/invalid_key_definitions',
      loc_html: __dirname + '/resources/invalid_key_definitions',
      cb: cb
    };

    qual.validate(options);
    assert.equal(errors.length, 2);
    assert.notEqual(errors[0].indexOf('i18n keys must all be in upper case (with only letters, numbers and underscores). Key: inv_key'), -1);
    assert.notEqual(errors[1].indexOf('i18n keys must be sorted alphabetically. Key KEY_4 breaks this rule.'), -1);
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
    console.log(errors)
    assert.notEqual(errors[0].indexOf('[ WARNING ] Non-translated text in view.html: "this was not translated"'), -1);
    assert.notEqual(errors[1].indexOf('[ WARNING ] Non-translated text in view.html: "this was not translated too"'), -1);
  });
});

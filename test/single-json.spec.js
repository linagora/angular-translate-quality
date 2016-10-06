'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var qual = require('../lib/index.js');


describe('Validation of a single JSon file', function() {

  var errors = [];
  var cb = function(msg) {
    errors.push(msg);
  };

  var options = qual.fix_options({cb: cb});
  beforeEach(function() {
    errors = [];
  });


  it('should ignore files without content', function() {

    qual.verify_i18n_one(options, '');
    assert.deepEqual(errors, []);

    qual.verify_i18n_one(options, '\n\n\n');
    assert.deepEqual(errors, []);
  });


  it('should detect trailing spaces', function() {

    qual.verify_i18n_one(options, '  ');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Trailing spaces '), -1);

    errors = [];
    qual.verify_i18n_one(options, '\n\n\t\n');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Trailing spaces '), -1);

    errors = [];
    qual.verify_i18n_one(options, '\n\n\t\n  ');
    assert.equal(errors.length, 2);
    assert.notEqual(errors[0].indexOf('Trailing spaces '), -1);
    assert.notEqual(errors[1].indexOf('Trailing spaces '), -1);
  });


  it('should verify the corretness of the JSon structure', function() {

    qual.verify_i18n_one(options, '"KEY": "value"');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY": "value",');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '\t"KEY": "value",');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '\t\t"KEY": "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Lines must match the following pattern:'), -1);

    errors = [];
    qual.verify_i18n_one(options, '"KEY": "value" ');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Trailing spaces '), -1);

    errors = [];
    qual.verify_i18n_one(options, '\'KEY\': \'value\'');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Lines must match the following pattern:'), -1);

    errors = [];
    qual.verify_i18n_one(options, '"KEY" : "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Lines must match the following pattern:'), -1);

    errors = [];
    qual.verify_i18n_one(options, 'KEY: value');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Lines must match the following pattern:'), -1);

    errors = [];
    qual.verify_i18n_one(options, '\n"KEY": "value"\n');
    assert.equal(errors.length, 0);

    errors = [];
    qual.verify_i18n_one(options, '"KEY" "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Lines must match the following pattern:'), -1);
  });


  it('should verify keys are in upper case', function() {

    qual.verify_i18n_one(options, '"KEY": "value"');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"key": "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('i18n keys must all be in upper case'), -1);
  });


  it('should verify only letters, numbers and underscores are accepted in keys', function() {

    qual.verify_i18n_one(options, '"KEY_ONE": "value"');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"1_ST_KEY": "value"');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY-1": "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('i18n keys must all be in upper case'), -1);

    errors = [];
    qual.verify_i18n_one(options, '"KEY_@": "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('i18n keys must all be in upper case'), -1);
  });


  it('should detect duplicate keys', function() {

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value"\n"KEY_3": "value"\n"KEY_4": "value"');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value"\n"KEY_1": "value"\n"KEY_4": "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('Duplicate key: KEY_1'), -1);

    errors = [];
    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value"\n"KEY_1": "value"\n"KEY_2": "value"');
    assert.equal(errors.length, 2);
    assert.notEqual(errors[0].indexOf('Duplicate key: KEY_1'), -1);
    assert.notEqual(errors[1].indexOf('Duplicate key: KEY_2'), -1);
  });


  it('should verify keys are sorted alpĥabetically', function() {

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value"\n"KEY_3": "value"\n"KEY_4": "value"');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_3": "value"\n"KEY_2": "value"\n"KEY_4": "value"');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('i18n keys must be sorted alphabetically. Key KEY_2'), -1);

    errors = [];
    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_4": "value"\n"KEY_3": "value"\n"KEY_2": "value"');
    assert.equal(errors.length, 2);
    assert.notEqual(errors[0].indexOf('i18n keys must be sorted alphabetically. Key KEY_3'), -1);
    assert.notEqual(errors[1].indexOf('i18n keys must be sorted alphabetically. Key KEY_2'), -1);
  });


  it('should detect missing closing tags (HTML in values)', function() {

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is <strong>there</strong>."\n');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is <strong>there</strong><br />."\n');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is here<br />."\n');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is <strong>there<strong>."\n');
    assert.equal(errors.length, 2);
    assert.notEqual(errors[0].indexOf('A HTML tag is not closed correctly. Tag: strong. Key: KEY_2'), -1);
    assert.notEqual(errors[1].indexOf('A HTML tag is not closed correctly. Tag: strong. Key: KEY_2'), -1);

    errors = [];
    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is <strong>here</strong> and also <strong>there."\n');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('A HTML tag is not closed correctly. Tag: strong. Key: KEY_2'), -1);
  });


  it('should detect missing opening tags (HTML in values)', function() {

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is <strong>there</strong>."\n');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is <strong>there</strong><br />."\n');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is here<br />."\n');
    assert.equal(errors.length, 0);

    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is </strong>there</strong>."\n');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('A HTML tag has no opening match. Tag: strong. Key: KEY_2'), -1);

    errors = [];
    qual.verify_i18n_one(options, '"KEY_1": "value"\n"KEY_2": "value is <strong>here</strong> and also there</strong>."\n');
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('A HTML tag has no opening match. Tag: strong. Key: KEY_2'), -1);
  });


  it('should return the right result)', function() {

    var res = qual.verify_i18n_one(options, '');
    assert.equal(errors.length, 0);
    assert.isFalse(res.failure);
    assert.deepEqual(res.keys, []);
    assert.deepEqual(res.all, {});

    res = qual.verify_i18n_one(options, '"KEY_1": "value"');
    assert.equal(errors.length, 0);
    assert.isFalse(res.failure);
    assert.deepEqual(res.keys, ['KEY_1']);
    assert.deepEqual(res.all, {KEY_1: 'value'});

    res = qual.verify_i18n_one(options, '"key": "value"');
    assert.isTrue(res.failure);
    assert.equal(errors.length, 1);
    assert.notEqual(errors[0].indexOf('i18n keys must all be in upper case'), -1);
  });


  it('should ignore curly brackets)', function() {

    var res = qual.verify_i18n_one(options, '{\n"KEY_1": "value"\n}');
    assert.equal(errors.length, 0);
    assert.isFalse(res.failure);
    assert.deepEqual(res.keys, ['KEY_1']);
    assert.deepEqual(res.all, {KEY_1: 'value'});
  });
});

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var qual = require('../lib/index.js');


describe('Options', function() {

  it('should fix options for empty objects', function() {

    var options = qual.fix_options();
    assert.isNotNull(options);
    assert.equal(options.loc_i18n, './src/i18n/');
    assert.equal(options.loc_html, './src/**/');
    assert.equal(options.cb, console.log);
    assert.equal(options.check_html, true);
    assert.equal(options.ignore_order, false);
    assert.equal(options.ignore_empty_values, false);
    assert.equal(options.fail_on_warning, false);
    assert.equal(options.indent, '\t');
    assert.deepEqual(options.exclusions, []);
  });


  it('should not modify user options', function() {

    var options = qual.fix_options({
      loc_i18n: 'i18n/',
      loc_html: 'html/',
      cb: function() {},
      check_html: false,
      ignore_order: true,
      ignore_empty_values: true,
      fail_on_warning: false,
      indent: '  ',
      exclusions: ['test']
    });

    assert.isNotNull(options);
    assert.equal(options.loc_i18n, 'i18n/');
    assert.equal(options.loc_html, 'html/');
    assert.notEqual(options.cb, console.log);
    assert.equal(options.check_html, false);
    assert.equal(options.ignore_order, true);
    assert.equal(options.ignore_empty_values, true);
    assert.equal(options.fail_on_warning, false);
    assert.equal(options.indent, '  ');
    assert.deepEqual(options.exclusions, ['test']);
  });


  it('should fix options for paths without trailing separator', function() {

    var options = qual.fix_options({
      loc_i18n: './src/i18n',
      loc_html: './src/**'
    });

    assert.isNotNull(options);
    assert.equal(options.loc_i18n, './src/i18n/');
    assert.equal(options.loc_html, './src/**/');
    assert.equal(options.cb, console.log);
  });
});


var expect = require('chai').expect;
var readFile = require('fs').readFile;
var path = require('path');

var unserialize = require('..').unserialize;


function test_serialized_data (i) {
  return function (done) {
    var expected = require('./fixtures/unserialized-data-' + i + '.json');
    readFile(path.join(__dirname, 'fixtures', 'serialized-data-' + i + '.txt'), function (err, buffer) {
      if (err) return done(err);
      var unserialized = unserialize(buffer.toString());
      expect(unserialized).to.eql(expected);
      done();
    });
  };
}

function test_serialized_error (i) {
  return function (done) {
    readFile(path.join(__dirname, 'fixtures', 'serialized-error-' + i + '.txt'), function (err, buffer) {
      if (err) return done(err);
      expect(unserialize.bind(this, buffer.toString())).to.throw(SyntaxError);
      done();
    });
  };
}

describe('unserialize()', function () {
  it('should unserialize data sample #1', test_serialized_data(1));
  it('should unserialize data sample #2', test_serialized_data(2));
  it('should unserialize data sample #3', test_serialized_data(3));
  it('should unserialize data sample #4', test_serialized_data(4));
  it('should fail on erronous data sample #1', test_serialized_error(1));
  it('should fail on erronous data sample #2', test_serialized_error(1));
});

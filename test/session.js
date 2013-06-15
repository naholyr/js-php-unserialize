
var expect = require('chai').expect;
var readFile = require('fs').readFile;
var path = require('path');

var unserialize = require('..').unserializeSession;


describe('unserializeSession()', function () {
  it('should unserialize data sample', function (done) {
    var expected = require('./fixtures/unserialized-session.json');
    readFile(path.join(__dirname, 'fixtures', 'serialized-session.txt'), function (err, buffer) {
      if (err) return done(err);
      var unserialized = unserialize(buffer.toString());
      expect(unserialized).to.eql(expected);
      done();
    });
  });
  /*it('should unserialize data sample 2', function (done) {
    var expected = require('./fixtures/unserialized-session-2.json');
    readFile(path.join(__dirname, 'fixtures', 'serialized-session-2.txt'), function (err, buffer) {
      if (err) return done(err);
      var unserialized = unserialize(buffer.toString());
      expect(unserialized).to.eql(expected);
      done();
    });
  });*/
});

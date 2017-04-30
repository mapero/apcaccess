var assert = require('assert');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");

chai.should();
chai.use(chaiAsPromised);

var ApcAccess = require('../lib/apcaccess');
var client = new ApcAccess();

var host = process.env.HOST || 'localhost';
var port = process.env.PORT || 3551;

describe('apcaccess', function() {
  describe('#connect()', function() {
    afterEach(function() {
      if(client.isConnected) return client.disconnect();
    });
    it('should be fulfilled', function() {
      return client.connect(host, port).should.be.fulfilled;
    });
    it('with wrong host should be rejected with Error', function() {
      return client.connect('unknownhost', port).should.be.rejectedWith(Error);
    });
    it('with wrong port should be rejected with Error', function() {
      return client.connect(host, 1234).should.be.rejectedWith(Error);
    });
  });
  describe('.isConnected', function() {
    afterEach(function() {
      if(client.isConnected) return client.disconnect();
    });
    it('should return false before connect', function() {
      client.isConnected.should.be.false;
    });
    it('should return true after connect', function() {
      return client.connect(host, port).then(function() {
        client.isConnected.should.be.true;
      });
    });
    it('should return false after disconnect', function() {
      return client.connect(host, port)
        .then(function() { return client.disconnect(); })
        .then(function() {
          client.isConnected.should.be.false;
        });
    });
  });
  describe('#getStatus', function() {
    beforeEach(function() {
      return client.connect(host, port);
    });
    afterEach(function() {
      return client.disconnect();
    });
    it('should return a string', function() {
      return client.getStatus().should.be.a.String;
    });
  });
  describe('#getStatusJson', function() {
    beforeEach(function() {
      return client.connect(host, port);
    });
    afterEach(function() {
      return client.disconnect();
    });
    it('should return an Object', function() {
      return client.getStatusJson().should.be.an.Object;
    });
  });
  describe('#getEvents', function() {
    beforeEach(function() {
      return client.connect(host, port);
    });
    afterEach(function() {
      return client.disconnect();
    });
    it('should return a string', function() {
      return client.getStatus().should.be.a.String;
    });
  });
});

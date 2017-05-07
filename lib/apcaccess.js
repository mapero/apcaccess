"use strict";

var net = require('net');
var events = require('events');
var util = require('util');

var ApcAccess = function() {
  this._waitForResponse = false;
  this._socket = new net.Socket();
  this._isConnected = false;
  Object.defineProperty(this, 'isConnected', { writeable: false, get: () => {
    return this._isConnected;
  }});
  this._requests = [];
  this._receiveBuffer = Buffer.allocUnsafe(0);
  this._socket.on('data', (data) => {
    var req = this._requests[0];
    if(req && this._waitForResponse) {
      this._receiveBuffer = Buffer.concat([this._receiveBuffer, data], this._receiveBuffer.length + data.length);
      while(this._receiveBuffer.length > 2) {
        var length = this._receiveBuffer.readUInt16BE(0);
        req.res += this._receiveBuffer.toString('ascii',2,length+2);
        this._receiveBuffer = this._receiveBuffer.slice(length+2);
      }
      if(this._receiveBuffer.length === 2 && this._receiveBuffer.readUInt16BE(0) === 0) {
        var req = this._requests.shift();
        this._waitForResponse = false;
        this._receiveBuffer = Buffer.allocUnsafe(0);
        process.nextTick(function() {
          req.fulfill(req.res);
        });
        this._flush();
      }
    }
  });
  this._socket.on('close', () => {
    this._isConnected = false;
    this.emit('disconnect');
  });
  this._socket.on('connect', () => {
    this._isConnected = true;
    this.emit('connect');
  });
};

util.inherits(ApcAccess, events);

ApcAccess.prototype.connect = function(host, port) {
  port = port || 3551;
  host = host || 'localhost';
  return new Promise((fulfill, reject) => {

    var fulfillConnect = () => {
      clear();
      fulfill();
    };

    var rejectConnect = (error) => {
      clear();
      reject(error);
    };

    var clear = () => {
      this._socket.removeListener('connect', fulfillConnect);
      this._socket.removeListener('error', rejectConnect);
    };

    if(!this._isConnected && !this._socket.connecting) {
      this._socket.connect(port, host);
      this._socket.on('connect', fulfillConnect);
      this._socket.on('error', rejectConnect);
    } else if (this._isConnected) {
      reject(new Error('Already connected to '+this._socket.remoteAddress+':'+this._socket.remotePort));
    } else {
      reject(new Error('Already connecting'));
    }
  });
};

ApcAccess.prototype.disconnect = function() {
  return new Promise((fulfill, reject) => {

    var fulfillDisconnect = () => {
      clear();
      fulfill();
    };

    var rejectDisconnect = (error) => {
      clear();
      reject(error);
    };

    var clear = () => {
      this._socket.removeListener('close', fulfillDisconnect);
      this._socket.removeListener('error', rejectDisconnect);
    };

    this._socket.end();
    this._socket.on('close', fulfillDisconnect);
    this._socket.on('error', rejectDisconnect);
  });
};

ApcAccess.prototype.getStatus = function() {
  return new Promise((fulfill, reject) => {
    this._requests.push({
      fulfill: fulfill,
      reject: reject,
      cmd: 'status',
      res: ''
    });
    this._flush();
  });
};

ApcAccess.prototype.getStatusJson = function() {
  return new Promise((fulfill, reject) => {
    this.getStatus().then((result) => {
      var re = /(\w+\s?\w+)\s*:\s(.+)?\n/g;
      var matches = {};
      var match = re.exec(result);
      while (match != null) {
        matches[match[1]] = match[2];
        match = re.exec(result);
      }
      fulfill(matches);
    }).catch((err) => {
      reject(err);
    });
  });
};

ApcAccess.prototype.getEvents = function() {
  return new Promise((fulfill, reject) => {
    this._requests.push({
      fulfill: fulfill,
      reject: reject,
      cmd: 'events',
      res: ''
    });
    this._flush();
  });
};

ApcAccess.prototype._flush = function() {
  var req = this._requests[0];
  if(req && !this._waitForResponse) {
    this._waitForResponse = true;
    var buffer = Buffer.allocUnsafe(req.cmd.length + 2);
    buffer.writeUInt16BE(req.cmd.length, 0);
    buffer.write(req.cmd,2);
    this._socket.write(buffer);
  }
};

module.exports = ApcAccess;

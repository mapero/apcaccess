var net = require('net');

var hex = require("hex");

var re = /^(\w+\s?\w+)\s*:\s(.+)\n?$/;


var ApcAccess = function() {
  this._waitForResponse = false;
  this._socket = new net.Socket();
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
          req.handler(req.res);
        });
        this._flush();
      }
    }
  });
};

ApcAccess.prototype = {
  connect: function() {
    this._socket.connect(3551, 'obelix', () => {
      console.log('Connected');
    });
  },
  disconnect: function() {
    this._socket.end();
    console.log('disconnected');
  },
  getStatus: function() {
    this._requests.push({
      handler: this._statusHandler,
      cmd: 'status',
      res: ''
    });
    this._flush();
  },
  getEvents: function() {
    this._requests.push({
      handler: this._eventsHandler,
      cmd: 'events',
      res: ''
    });
    this._flush();
  },
  _statusHandler: function(data) {
    console.log(data);
  },
  _eventsHandler: function(data) {
    console.log(data);
  },
  _flush: function() {
    var req = this._requests[0];
    if(req && !this._waitForResponse) {
      this._waitForResponse = true;
      var buffer = Buffer.allocUnsafe(req.cmd.length + 2);
      buffer.writeUInt16BE(req.cmd.length, 0);
      buffer.write(req.cmd,2);
      this._socket.write(buffer);
    }
  }
};

var NisClient = function() {
  this._client = new net.Socket();
  this._client.on('data', (data) => {
    this._dataReceived(data);
  });
  this._buffer = Buffer.allocUnsafe(0);
  this._busy = false;
  this._response = {};
};

NisClient.prototype.connect = function() {
  this._client.connect(3551, 'obelix', () => {
    console.log('Connected');
  });
};

NisClient.prototype._sendCmd = function(cmd) {
  if (!(typeof cmd === 'string' || cmd instanceof String)) throw new Error('Cmd has to be a string');
  var buf = Buffer.allocUnsafe(cmd.length + 2);
  buf.writeUInt16BE(cmd.length, 0);
  buf.write(cmd,2);
  this._client.write(buf);
};

NisClient.prototype.requestStatus = function() {
  if (this._busy === true) {
    throw new Error('Client busy and waiting for server response');
  }
  this._busy = true;
  this._requestType = 'status';
  this._response = {};
  this._sendCmd('status');
};

NisClient.prototype.requestEvents = function() {
  if (this._busy === true) {
    throw new Error('Client busy and waiting for server response');
  }
  this._busy = true;
  this._requestType = 'events';
  this._response = '';
  this._sendCmd('events');
};

NisClient.prototype._dataReceived = function(data) {
  console.log(this._requestType);
  if(this._requestType === 'events') {
    this._handleEventsReply(data);
  } else if (this._requestType === 'status') {
    this._handleStatusReply(data);
  }
};

NisClient.prototype._handleEventsReply = function(data) {
  this._buffer = Buffer.concat([this._buffer, data], this._buffer.length + data.length);
  while(this._buffer.length > 2) {
    var length = this._buffer.readUInt16BE(0);
    var content = this._buffer.toString('ascii',2,length+2);
    this._response += content;
    this._buffer = this._buffer.slice(length+2);
  }
  if(this._buffer.length === 2 && this._buffer.readUInt16BE(0) === 0) {
    console.log("Message received:");
    console.log(this._response);
    this._buffer = Buffer.allocUnsafe(0);
    this._busy = false;
  }
};

NisClient.prototype._handleStatusReply = function(data) {
  this._buffer = Buffer.concat([this._buffer, data], this._buffer.length + data.length);
  while(this._buffer.length > 2) {
    var length = this._buffer.readUInt16BE(0);
    var content = this._buffer.toString('ascii',2,length+2);
    var match = content.match(re);
    this._response[match[1]] = match[2];
    this._buffer = this._buffer.slice(length+2);
  }
  if(this._buffer.length === 2 && this._buffer.readUInt16BE(0) === 0) {
    console.log("Message received:");
    console.log(this._response);
    this._buffer = Buffer.allocUnsafe(0);
    this._busy = false;
  }
};

var apcaccess = new ApcAccess();
apcaccess.connect();

apcaccess.getStatus();

apcaccess.getStatus();

apcaccess.getEvents();

//apcaccess.disconnect();

// var client = new NisClient();
// client.connect();
//
// function loopSt() {
//   client.requestStatus();
//   //client.requestEvents();
//   setTimeout(loopEv, 1000);
// }
//
// function loopEv() {
//   client.requestEvents();
//   //client.requestEvents();
//   setTimeout(loopSt, 1000);
// }
//
// loopEv();

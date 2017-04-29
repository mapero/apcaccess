var net = require('net');

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
          req.fulfill(req.res);
        });
        this._flush();
      }
    }
  });
};

ApcAccess.prototype = {
  connect: function() {
    return new Promise((fulfill, reject) => {
      this._socket.connect(3551, 'obelix');
      this._socket.on('connect', fulfill);
      this._socket.on('error', reject);
    });
  },
  disconnect: function() {
    return new Promise((fulfill, reject) => {
      this._socket.end();
      this._socket.on('close', fulfill);
      this._socket.on('error', reject);
    });
  },
  getStatus: function() {
    return new Promise((fulfill, reject) => {
      this._requests.push({
        fulfill: fulfill,
        reject: reject,
        cmd: 'status',
        res: ''
      });
      this._flush();
    });
  },
  getStatusJson: function() {
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
  },
  getEvents: function() {
    return new Promise((fulfill, reject) => {
      this._requests.push({
        fulfill: fulfill,
        reject: reject,
        cmd: 'events',
        res: ''
      });
      this._flush();
    });
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

var apcaccess = new ApcAccess();
apcaccess.connect().then(function() {
  console.log('Connected!');
  return apcaccess.getStatus();
}).then(function(result) {
  console.log(result);
  return apcaccess.getStatusJson();
}).then(function(result) {
  console.log(result);
  return apcaccess.disconnect();
}).then(function() {
  console.log('Disconnected!');
}).catch(function(err) {
  console.log(err);
});

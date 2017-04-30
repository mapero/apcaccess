#!/usr/bin/env node

var ApcAccess = require('./lib/apcaccess');
var cli = require('cli');

var options = cli.parse({
  host: ['H', 'Hostname or ip address of the apcupsd nis', 'string', 'localhost'],
  port: ['p', 'Port of the apcupsd nis', 'int', 3551]
},
['status', 'statusJson', 'events']);

var apcaccess = new ApcAccess();
apcaccess.connect(options.host, options.port)
.then(function() {
  if(cli.command === 'status') return apcaccess.getStatus();
  else if(cli.command === 'statusJson') return apcaccess.getStatusJson();
  else if(cli.command === 'events') return apcaccess.getEvents();
})
.then(function(result) {
  console.log(result);
  return apcaccess.disconnect();
})
.catch(function(err) {
  console.log(err);
});

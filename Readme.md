# apcaccess client library and cli written in node.js

[![npm version](https://badge.fury.io/js/apcaccess.svg)](https://badge.fury.io/js/apcaccess)

[![NPM](https://nodei.co/npm/apcaccess.png)](https://nodei.co/npm/apcaccess/)

This is a node.js implementation of an apcupsd nis client. The module comes with a command line interface and a library you can use in your projects.

## Prerequisites

An APC UPS Daemon has to run on a local or remote machine and has to be configured as network information server (NIS). For more information visit the apcupsd website.

* [APC UPS Daemon](http://www.apcupsd.org/) - The APC UPS Daemon
* [APCUPSD User Manual](https://maven.apache.org/) - The User Manual for the APC UPS Daemon containing installation instructions
* [APCUPSD NIS Example Configuration](http://www.apcupsd.org/manual/manual.html#nis-server-client-configuration-using-the-net-driver) - Howto configure the APCUPSD as NIS

## Command Line Interface

These instructions will help you to install and use the command line interface on your local machine.

### Installing

Simply install the package globally over npm. This will create a symlink in your bin folder and installs all the required dependencies.

```
npm install -g apcaccess
```

### Usage

```
Usage:
  apcaccessjs [OPTIONS] <command> [ARGS]

Options:
  -H, --host [STRING]    Hostname or ip address of the apcupsd nis (Default is localhost)
  -p, --port [NUMBER]    Port of the apcupsd nis (Default is 3551)
  -h, --help             Display help and usage details

Commands:
  events, status, statusJson
```

## Library

A short introduction and example how to use the apcaccess library. The library uses **Promises**.

### Examples

#### Create a client and connect to server

```javascript
var ApcAccess = require('apcaccess');
var client = new ApcAccess();

client.connect('localhost', 3551)
  .then(function() {
    console.log('Connected');
  })
  .catch(function(err) {
    console.log(err);
  })
```

#### Request the status and disconnect

```javascript
var ApcAccess = require('apcaccess');
var client = new ApcAccess();

client.connect('localhost', 3551)
  .then(function() {
    return client.status();
  })
  .then(function(result) {
    console.log(result)
    return client.disconnect();
  })
  .then(function() {
    console.log('Disconnected');
  })
  .catch(function(err) {
    console.log(err);
  })  
```

Output:
```
APC      : 001,034,0839
DATE     : 2017-04-30 13:41:04 +0200  
HOSTNAME : alarmpi
VERSION  : 3.14.14 (31 May 2016) unknown
UPSNAME  : alarmpi
CABLE    : USB Cable
DRIVER   : USB UPS Driver
UPSMODE  : Stand Alone
STARTTIME: 2017-04-28 12:04:47 +0200  
MODEL    : Back-UPS ES 700G
STATUS   : ONLINE
LINEV    : 232.0 Volts
LOADPCT  : 5.0 Percent
BCHARGE  : 100.0 Percent
TIMELEFT : 36.4 Minutes
MBATTCHG : 5 Percent
MINTIMEL : 3 Minutes
MAXTIME  : 0 Seconds
SENSE    : Medium
LOTRANS  : 180.0 Volts
HITRANS  : 266.0 Volts
ALARMDEL : 30 Seconds
BATTV    : 13.5 Volts
LASTXFER : Unacceptable line voltage changes
NUMXFERS : 0
TONBATT  : 0 Seconds
CUMONBATT: 0 Seconds
XOFFBATT : N/A
STATFLAG : 0x05000008
SERIALNO : 5B1325T16968  
BATTDATE : 2013-06-23
NOMINV   : 230 Volts
NOMBATTV : 12.0 Volts
FIRMWARE : 871.O2 .I USB FW:O2
END APC  : 2017-04-30 13:41:26 +0200  
```

#### Request events and disconnect

```javascript
var ApcAccess = require('apcaccess');
var client = new ApcAccess();

client.connect('localhost', 3551)
  .then(function() {
    return client.events();
  })
  .then(function(result) {
    console.log(result)
    return client.disconnect();
  })
  .then(function() {
    console.log('Disconnected');
  })
  .catch(function(err) {
    console.log(err);
  })  
```

Output:
```
2017-04-28 12:01:15 +0200  Cannot create /run/apcupsd/LCK.. serial port lock file: ERR=No such file or directory
2017-04-28 12:01:15 +0200  apcupsd FATAL ERROR in apcupsd.c at line 221
Unable to create UPS lock file.
  If apcupsd or apctest is already running,
  please stop it and run this program again.
2017-04-28 12:01:15 +0200  apcupsd error shutdown completed
2017-04-28 12:01:35 +0200  Cannot create /run/apcupsd/LCK.. serial port lock file: ERR=No such file or directory
2017-04-28 12:01:35 +0200  apcupsd FATAL ERROR in apcupsd.c at line 221
Unable to create UPS lock file.
  If apcupsd or apctest is already running,
  please stop it and run this program again.
2017-04-28 12:01:35 +0200  apcupsd error shutdown completed
2017-04-28 12:04:47 +0200  apcupsd 3.14.14 (31 May 2016) unknown startup succeeded
```

#### Request status as JSON and disconnect

```javascript
var ApcAccess = require('apcaccess');
var client = new ApcAccess();

client.connect('localhost', 3551)
  .then(function() {
    return client.statusJson();
  })
  .then(function(result) {
    console.log(result)
    return client.disconnect();
  })
  .then(function() {
    console.log('Disconnected');
  })
  .catch(function(err) {
    console.log(err);
  })  
```

Output:
```javascript
{ APC: '001,034,0839',
  DATE: '2017-04-30 13:47:07 +0200  ',
  HOSTNAME: 'alarmpi',
  VERSION: '3.14.14 (31 May 2016) unknown',
  UPSNAME: 'alarmpi',
  CABLE: 'USB Cable',
  DRIVER: 'USB UPS Driver',
  UPSMODE: 'Stand Alone',
  STARTTIME: '2017-04-28 12:04:47 +0200  ',
  MODEL: 'Back-UPS ES 700G ',
  STATUS: 'ONLINE ',
  LINEV: '232.0 Volts',
  LOADPCT: '5.0 Percent',
  BCHARGE: '100.0 Percent',
  TIMELEFT: '36.4 Minutes',
  MBATTCHG: '5 Percent',
  MINTIMEL: '3 Minutes',
  MAXTIME: '0 Seconds',
  SENSE: 'Medium',
  LOTRANS: '180.0 Volts',
  HITRANS: '266.0 Volts',
  ALARMDEL: '30 Seconds',
  BATTV: '13.5 Volts',
  LASTXFER: 'Unacceptable line voltage changes',
  NUMXFERS: '0',
  TONBATT: '0 Seconds',
  CUMONBATT: '0 Seconds',
  XOFFBATT: 'N/A',
  STATFLAG: '0x05000008',
  SERIALNO: '5B1325T16968  ',
  BATTDATE: '2013-06-23',
  NOMINV: '230 Volts',
  NOMBATTV: '12.0 Volts',
  FIRMWARE: '871.O2 .I USB FW:O2',
  'END APC': '2017-04-30 13:47:10 +0200  ' }
```

## Authors

* **Jochen Scheib** - [mapero](https://github.com/mapero)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

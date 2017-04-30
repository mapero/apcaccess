var ApcAccess = require('./lib/apcaccess');

var apcaccess = new ApcAccess();
apcaccess.connect('obelix', 3551)
.then(function() {return apcaccess.getStatus();})
.then(function(result) {
  console.log(result);
  return apcaccess.getStatusJson();
})
.then(function(result) {
  console.log(result);
  return apcaccess.disconnect();
})
.then(function() {
  console.log('Disconnected!');
})
.catch(function(err) {
  console.log(err);
});

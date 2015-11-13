
// START THE SERVER
var http = require('http');
var app = require('./app');
var port = process.env.NODE_PORT || 6969;
http.createServer(app).listen(port, function (err) {
  if (err) {
    console.log("[ERROR]", err);
  }
  else {
    console.log('Shrooms server is running. port: %s, env: %s, service-log-level:%s', port, app.get('env'), process.env.NODE_SERVICE_LOG);
  }
});

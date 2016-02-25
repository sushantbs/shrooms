
// START THE SERVER
var http = require('http');
//var app = require('./app');
var port = process.env.NODE_PORT || process.env.OPENSHIFT_NODEJS_PORT || 6969;
var server_ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var csessions = require('client-sessions');

var app = express();

app.use(csessions({
  cookieName: 'roomsession', // cookie name dictates the key name added to the request object
  secret: 'N501tgoe$4newL!fe', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  cookie: {
    httpOnly: false
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
var io = require('socket.io')(server);

//var socketObj = require('./socket')(io, app);

app.use('/api', api(io));
app.use('/users', users);
app.use('*', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(require('errorhandler')());

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


server.listen(port, server_ip, function (err) {
  if (err) {
    console.log("[ERROR]", err);
  }
  else {
    console.log('Shrooms server is running. port: %s, env: %s, service-log-level:%s', port, app.get('env'), process.env.NODE_SERVICE_LOG);
  }
});

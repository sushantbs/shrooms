var express = require('express');
var router = express.Router();

/* GET home page. */
if (process.env.NODE_ENV !== 'development') {
	router.get('/', function(req, res, next) {
	  res.render('index', {title: 'Shrooms - Secure Rooms'});
	});
} else{
	router.get('/', function(req, res, next) {
	  res.render('dev', {title: 'DEVShrooms - Secure Rooms'});
	});
}

module.exports = router;

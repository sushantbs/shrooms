var express = require('express');
var router = express.Router();
var debug = require('debug')('api');

router.post('/create', function (req, res, next) {
	var postBody = req.body;
	debug(postBody);

	res.send('Ok');
});

module.exports = router;

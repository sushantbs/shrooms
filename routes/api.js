var express = require('express');
var router = express.Router();
var debug = require('debug')('api');
var Promise = require('es6-promise').Promise;

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto-js');

function connectToDB () {

	var promise = new Promise(function (resolve, reject) {

		MongoClient.connect('mongodb://localhost:27017/rooms', function (err, dbhandle) {

			if (err) {
				return reject(err);
			}

			return resolve(dbhandle);
		});
	});

	return promise;
}

router.post('/create', function (req, res, next) {
	var postBody = req.body;
	debug(postBody);

	postBody.participants = [];
	postBody._id = new ObjectId();

	connectToDB()
		.then(function (dbhandle) {

			dbhandle.collection('rooms').insertOne(postBody, function (err, result) {
				if (err) {
					res.status(500).send(err);
					return;
				}

				res.send({status: 'success', data: postBody._id});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

router.post('/join', function (req, res, next) {

	var postBody = req.body;
	debug(postBody);

	var objectId = ObjectId(postBody.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').updateOne({_id: objectId}, {$addToSet: {participants: postBody.name}}, function (err, update) {

				if (err) {
					console.log(err);
					res.status(500).end('Error updating the Room');
					return;
				}

				if (!update.result.n) {
					console.log('No result');
					res.status(500).end('Room not found');
					return;
				}

				dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

					if (err) {
						console.log(err);
						res.status(500).send(err);
						return;
					}

					res.send({status: 'success', data: fetch});
				});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

router.post('/leave', function (req, res, next) {

	var postBody = req.body;
	debug(postBody);

	var objectId = ObjectId(postBody.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').updateOne({_id: objectId}, {$pull: {participants: postBody.name}}, function (err, update) {

				if (err) {
					console.log(err);
					res.status(500).end('Error updating the Room');
					return;
				}

				if (!update.result.n) {
					console.log('No result');
					res.status(500).end('Room not found');
					return;
				}

				dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

					if (err) {
						console.log(err);
						res.status(500).send(err);
						return;
					}

					res.send({status: 'success', data: fetch});
				});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

router.get('/roomstate', function (req, res, next) {

	var queryObj = req.query;
	debug(queryObj);

	var objectId = ObjectId(queryObj.roomId),
		resultObj = {};

	connectToDB()
		.then(function (dbhandle) {
			dbhandle.collection('rooms').findOne({_id: objectId}, function (err, fetch) {

				if (err) {
					console.log(err);
					res.status(500).send(err);
					return;
				}

				res.send({status: 'success', data: fetch});
			});
		})
		.catch(function (err) {
			console.log(err);
			res.status(500).send(err);
		});
});

module.exports = router;

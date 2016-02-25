var Promise = require('es6-promise').Promise;
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');

var connectionPool = [];
var maxConnections = 1;
var connectionCount = 0;
var connectionQueue = [];

function next (handleObj) {

  var item = connectionQueue.shift();
  if (item) {
    item.execute(handleObj);
  }
}

module.exports = {
    disconnect: function () {

      _.forEach(connectionPool, function (handleObj) {
        console.log('close the connection');
        handleObj.handle.close();
        handleObj.use = null;
        handleObj.release = null;
      });

      _.forEach(connectionQueue, function (queueObj) {
        queueObj.execute = null;
      });

      connectionPool = [];
      connectionQueue = [];
    },
    connect: function () {
      // default to a 'localhost' configuration:
      var connection_string = 'localhost:27017/rooms';
      // if OPENSHIFT env variables are present, use the available connection info:
      if(process.env.OPENSHIFT_MONGODB_DB_URL){
        connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
      }

      for (var i = 0; i < maxConnections; i += 1) {

        MongoClient.connect(('mongodb://' + connection_string), function (err, dbhandle) {

      		if (err) {
            i -= 1;
            return console.error(err);
            reject(err);
      		}

          //resolve(dbhandle);
          connectionPool.push({
            handle: dbhandle.collection('rooms'),
            busy: false,
            use: function () {
              this.busy = true;
              connectionCount += 1;
            },
            release: function () {
              this.busy = false;
              connectionCount -= 1;
              next(this);
            }
          });
      	});
      }
    },
    getHandle: function () {

      var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          if (/*connectionCount < maxConnections*/true) {
            _.forEach(connectionPool, function (handleObj) {
              //if (!handleObj.busy) {
              if (true) {
                handleObj.use();
                resolve(handleObj);
              }
            });
          } else {
            var queueObj = {};
            queueObj.execute = function (handleObj) {
              handleObj.use();
              resolve(handleObj);
            };
            connectionQueue.push(queueObj);
          }
        }, 5);
      });

      return promise;
    }
}
// module.exports = function () {
//
//   return new Promise(function (resolve, reject) {
//     MongoClient.connect('mongodb://localhost:27017/rooms', function (err, dbhandle) {
//
//   		if (err) {
//         i -= 1;
//         return console.error(err);
//         reject(err);
//   		}
//
//       console.log('connection created');
//       //resolve(dbhandle);
//       connectionPool.push({
//         handle: dbhandle,
//         busy: false,
//         use: function () {
//           this.busy = true;
//           connectionCount += 1;
//         },
//         release: function () {
//           this.busy = false;
//           connectionCount -= 1;
//           next(this);
//         }
//       });
//   	});
//   });
// }

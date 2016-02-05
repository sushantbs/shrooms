var Promise = require('es6-promise').Promise;
var MongoClient = require('mongodb').MongoClient;

var connectionPool = [];
var maxConnections = 10;
var connectionCount = 0;
var connectionQueue = [];

for (var i = 0; i < maxConnections; i += 1) {

}

function next (handleObj) {

  var item = connectionQueue.shift();
  if (item) {
    item.execute(handleObj);
  }
}

// module.exports = function () {
//
//   var promise = new Promise(function (resolve, reject) {
//     if (connectionCount < maxConnections) {
//       _.forEach(connectionPool, function (handleObj) {
//         if (!handleObj.busy) {
//           handleObj.use();
//           resolve(handleObj);
//         }
//       });
//     } else {
//       var queueObj = {};
//       queueObj.execute = function (handleObj) {
//         handleObj.use();
//         resolve(handleObj);
//       };
//       connectionQueue.push(queueObj);
//     }
//   });
//
//   return promise;
// };

module.exports = function () {

  return new Promise(function (resolve, reject) {
    MongoClient.connect('mongodb://localhost:27017/rooms', function (err, dbhandle) {

  		if (err) {
        i -= 1;
        return console.error(err);
        reject(err);
  		}

      console.log('connection created');
      resolve(dbhandle);
      // connectionPool.push({
      //   handle: dbhandle,
      //   busy: false,
      //   use: function () {
      //     this.busy = true;
      //     connectionCount += 1;
      //   },
      //   release: function () {
      //     this.busy = false;
      //     connectionCount -= 1;
      //     next(this);
      //   }
      // });
  	});
  });
}

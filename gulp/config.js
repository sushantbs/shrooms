module.exports = {
  nodemon: {
    script: 'server.js',
    ext: 'js jade',
    env: {'NODE_ENV': 'development', 'NODE_SERVICE_LOG': 'err'},
    watch : ['server.js', 'app.js', 'views/', 'routes/', 'shrooms/', 'socket.js'],
    nodeArgs: ['--debug'],
    delay:2
  },
  webpack: require('../webpack.config')
};

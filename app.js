var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io')(server)
    , port =  3005;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', function (socket) {
  console.log('connection');
});

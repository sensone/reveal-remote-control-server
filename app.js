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

  // listening remote controll
  socket.on('remote:right', function (data) {
    console.log('remote:right', data);
    socket.broadcast.emit('presentation:right', data);
  });

  socket.on('remote:left', function (data) {
    console.log('remote:left', data);
    socket.broadcast.emit('presentation:left', data);
  });

  socket.on('remote:up', function (data) {
    console.log('remote:up', data);
    socket.broadcast.emit('presentation:up', data);
  });

  socket.on('remote:down', function (data) {
    console.log('remote:down', data);
    socket.broadcast.emit('presentation:down', data);
  });

  // listening presentation
  socket.on('presentation:slidechanged', function (data) {
    console.log('presentation:slidechanged', data);
    socket.broadcast.emit('remote:slidechanged', data);
  });

});

var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io')(server)
    , os = require( 'os' )
    , mainPresentationConnect = false
    , state
    , ip = os.networkInterfaces().en0[1].address
    , port =  3005
    , portClient = 8000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', function (socket, data) {
  console.log('connection');

  if (!mainPresentationConnect) {
    mainPresentationConnect = true;
    socket.emit('presentation:createID', {link: 'http://' + ip + ':' + portClient});
  } else {
    socket.emit('presentation:setState', state);
  }

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

  socket.on('remote:connect', function (data) {
    console.log('remote:connect', data);
    socket.broadcast.emit('presentation:remoteConnected', data);
  });

  socket.on('remote:pointer', function (data) {
    console.log('remote:pointer', data);
    socket.broadcast.emit('presentation:pointer', data);
  });

  socket.on('remote:zoom', function (data) {
    console.log('remote:zoom', data);
    socket.broadcast.emit('presentation:zoom', data);
  });

  // listening presentation
  socket.on('presentation:slidechanged', function (data) {
    console.log('presentation:slidechanged', data);
    socket.broadcast.emit('remote:slidechanged', data);
    state = data;
  });

  socket.on('presentation:start', function(data) {
    console.log('presentation:start', data);

    state = data;
  })

});

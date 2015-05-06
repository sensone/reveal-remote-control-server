var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io')(server)
  , sessions = {}
  , port =  3005;

function generateToken() {
  var date = new Date().getTime()
    , token = date + '_' + Math.random().toString().replace('.', '');

  return token;
}

function verifySession(data) {
  var presentation_id = data && data.presentation_id ? data.presentation_id : undefined
    , session = presentation_id && sessions[presentation_id] ? sessions[presentation_id] : undefined;

  if (session && session.token === data.token) {
    return true;
  } else {
    return false;
  }
}

function setState(data) {
  if (verifySession(data)) {
    var session = sessions[data.presentation_id];

    session.state = data.state;
  }
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', function (socket, data) {

  socket.on('presentation:init', function(data) {
    var presentation_id = data.presentation_id;

    if (!sessions[presentation_id]) {
      var session = {};

      session.token = generateToken();
      session.state = data.state;

      sessions[presentation_id] = session;

      socket.emit('server:init', {token: session.token});
      console.log('server:init')
    } else if (data) {
      if (data.token) {
        socket.emit('server:init', {token: data.token});
      }
      console.log(666, 'fuck')
    }
  });

  socket.on('disconnect', function() {
    console.log('disconnect');
  });

  socket.on('remote:right', function (data) {
    console.log('remote:right', data);

    if (verifySession(data)) {
      socket.broadcast.emit('remote:right', data);
    }
  });

  socket.on('remote:left', function (data) {
    console.log('remote:left', data);

    if (verifySession(data)) {
      socket.broadcast.emit('remote:left', data);
    }
  });

  socket.on('remote:up', function (data) {
    console.log('remote:up', data);

    if (verifySession(data)) {
      socket.broadcast.emit('remote:up', data);
    }
  });

  socket.on('remote:down', function (data) {
    console.log('remote:down', data);

    if (verifySession(data)) {
      socket.broadcast.emit('remote:down', data);
    }
  });

  socket.on('remote:connect', function (data) {
    console.log('remote:connect', data);

    if (verifySession(data)) {
      socket.broadcast.emit('remote:remoteConnected', data);
    }
  });

  socket.on('remote:pointer', function (data) {
    console.log('remote:pointer', data);

    if (verifySession(data)) {
      socket.broadcast.emit('remote:pointer', data);
    }
  });

  socket.on('remote:zoom', function (data) {
    console.log('remote:zoom', data);

    if (verifySession(data)) {
      socket.broadcast.emit('remote:zoom', data);
    }
  });

  socket.on('presentation:slidechanged', function (data) {
    console.log('presentation:slidechanged', data);

    if (verifySession(data)) {
      socket.broadcast.emit('presentation:slidechanged', data);
      setState(data);
    } else {
      console.log('don\'t verified session');
    }
  });

});

var express = require('express')
  , _ = require('underscore')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io')(server)
  , sessions = []
  , remote_events = ['right', 'down', 'left', 'up', 'pointer', 'zoom']
  , port = process.env.PORT || 3005;

function generateToken() {
  var date = new Date().getTime()
    , token = date + '_' + Math.random().toString().replace('.', '');

  return token;
}

function createSession(socket, presentation_id, params) {
  var session;

  console.log('create presentation');

  session = {
    presentation: socket,
    presentation_id: presentation_id,
    presentation_socket_id: undefined,
    token: generateToken(),
    remote: undefined,
    remote_socket_id: undefined,
    data: params
  };

  sessions.push(session);
  session.presentation.emit('server:init', {token: session.token, qr: true});
}

function remoteEmit(event, data) {
  console.log(event, data)
  this.presentation.emit('remote:' + event, data);
}

// TODO: destroy events
function listenEvents(socket, session) {
  session.remote = socket;

  session.presentation.emit('remote:remoteConnected');
  session.remote.emit('presentation:slidechanged', session.data);

  session.presentation.on('presentation:slidechanged', function (data) {
    session.data = data;
    console.log('presentation:slidechanged')
    session.remote.emit('presentation:slidechanged', data);
  });

  _.each(remote_events, function(event) {
    session.remote.on('remote:' + event, _.bind(remoteEmit, session, event));
  });
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', function (socket, data) {
  console.log('connect new client');

  socket.on('presentation:init', function(params, presentation_id, token) {
    var session;
    console.log('presentation:init', presentation_id, token);

    if (!token) {
      createSession(socket, presentation_id, params);
    } else {
      session = _.findWhere(sessions, {token: token});

      if (session) {
        session.presentation.emit('server:init', {token: session.token, qr: true});
      } else {
        createSession(socket, presentation_id, params);
      }
    }
  });

  socket.on('remote:connect', function (data) {
    var session = _.findWhere(sessions, {token: data.token});

    console.log('remote:connect', data.token);

    if (session && session.presentation) {
      listenEvents(socket, session);
    }
  });

  socket.on('disconnect', function() {
    console.log('disconnect');
  });
});

var util = require('util')
  , express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , sio = require('socket.io')
  , RedisStore = sio.RedisStore
  , io = sio.listen(server)
  , opts = {redisSub:{host:'localhost', port:6379},redisPub:{host:'localhost', port:6379},redisClient:{host:'localhost', port:6379}}

io.set('store', new RedisStore(opts));
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);
io.sockets.on('connection', function(socket) {
  util.log('ShowControl -- Socket connected: ' + socket.id);

  socket.on('channel', function(ch) {
    socket.join(ch)
    util.log('ShowControl -- ' + socket.id + ' joined channel: ' + ch);
  });

  socket.on('disconnect', function() {
    util.log('ShowControl -- Socket disconnected: ' + socket.id);
  });
});

app.use(express.bodyParser());
app.post('/showcontrol', function (req, res) {
  util.log('ShowControl -- Sending message to: ' + req.body.channel);

  io.sockets.in(req.body.channel).emit('show_event', JSON.stringify(req.body.message));
  res.end();
});

server.listen(9999);
util.log('Listening');
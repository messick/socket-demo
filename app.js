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
  util.log('Socket connected: ' + socket.id);

  socket.on('subscribe', function(data) { 
    var message = socket.id + ' joined: ' + data.room;
    socket.join(data.room);
    io.sockets.in(data.room).emit('message_sent', message);
    util.log(message);
  })
  
  socket.on('unsubscribe', function(data) {
    var message = socket.id + ' left: ' + data.room;
    io.sockets.in(data.room).emit('message_sent', message);
    socket.leave(data.room); 
    util.log(message);
  })
  
  socket.on('disconnect', function() {
    util.log('Socket disconnected: ' + socket.id);
  });
});

app.use(express.bodyParser());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res)
{
    res.render('index.html');
});

app.post('/say', function (req, res) {
  util.log('Sending message to: ' + req.body.room);

  io.sockets.in(req.body.room).emit('message_sent', JSON.stringify(req.body.message));
  res.end();
});

server.listen(9999);
util.log('Listening');
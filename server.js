var http = require('http');
var express = require('express');
var sio = require('socket.io');
var app = express();
var server = http.createServer(app);
app.use(express.static(__dirname)); // 使用static中间件，可以引用到根目录下的所有静态文件
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/room.html');
});
server.listen(80);
console.log('服务器已启动...');
var io = sio.listen(server); // 使用socket.io维持http连接
var names = []; // 存放客户端连接的数组
io.sockets.on('connection', function (socket) {  // 使用io.sockets可以实现消息广播
  socket.on('login', function (name) {  // 监听客户端登入
    for (var i = 0; i < names.length; i++) {
      if (names[i] == name) {
        socket.emit('duplicate');
        return;
      }
    }
    names.push(name);
    io.sockets.emit('login', name);
    io.sockets.emit('sendClients', names);
  });
  socket.on('chat', function (data) {  // 监听客户端聊天消息
    io.sockets.emit('chat', data);
  });
  socket.on('logout', function (name) { // 监听客户端登出
    for (var i = 0; i < names.length; i++) {
      if (names[i] == name) {
        names.splice(i, 1);
        break;
      }
    }
    socket.broadcast.emit('logout', name); // socket.broadcast也可以实现消息广播
    io.sockets.emit('sendClients', names);
  });
});
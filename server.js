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
io.sockets.on('connection', function (socket) {  
  socket.on('login', function (name) {  // 监听客户端登入
    for (var i = 0; i < names.length; i++) {
      if (names[i] == name) {
        socket.emit('duplicate');
        return;
      }
    }
    names.push(name);
    socket.emit('loginSuccess'); // 向此连接返回登录成功消息
    socket.broadcast.emit('login', name); // socket.broadcast向除去建立该连接的客户端的所有客户端广播
    io.sockets.emit('sendClients', names); // io.sockets可以向所有客户端广播
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
    socket.emit('logoutSuccess'); // 向此连接返回登出成功消息
    socket.broadcast.emit('logout', name); 
    io.sockets.emit('sendClients', names);
  });
});
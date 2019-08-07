// require('socket.io/socket.io.js');
var userName, socket, tbxUsername, tbxMsg, divChat;
function window_onload() {
  divChat = document.getElementById('divchat');
  tbxUsername = document.getElementById('tbxUsername');
  tbxMsg = document.getElementById('tbxMsg');
  tbxUsername.focus();
  tbxUsername.select();
}
function AddMsg(msg) {
  divChat.innerHTML += msg + '<br>';
  if (divChat.scrollHeight > divChat.clientHeight)
    divChat.scrollTop = divChat.scrollHeight - divChat.clientHeight;
}
function btnLogin_onclick() {
  if (tbxUsername.value.trim() == '') {
    alert('请输入用户名');
    return;
  }
  userName = tbxUsername.value.trim();
  socket = io.connect();
  socket.on('connect', function () {
    AddMsg("与聊天服务器的连接已建立。");
    socket.on('login', function (name) {
      AddMsg('欢迎用户' + name + '进入聊天室。');
    });
    socket.on('sendClients', function (names) {
      var divRight = document.getElementById("divRight");
      var str = "";
      names.forEach(function (name) {
        str += name + "<br/>"
      });
      divRight.innerHTML = "用户列表<br/>";
      divRight.innerHTML += str;
    });
    socket.on('chat', function (data) {
      AddMsg(data.user + '说:' + data.msg);
    });
    socket.on('disconnect', function () {
      AddMsg('与聊天服务器的连接已断开。');
      document.getElementById("btnSend").disabled = true;
      document.getElementById("btnLogout").disabled = true;
      document.getElementById("btnLogin").disabled = "";
      var divRight = document.getElementById("divRight");
      divRight.innerHTML = "用户列表";
    });
    socket.on('logout', function (name) {
      AddMsg('用户' + name + '已退出聊天室。');
    });
    socket.on('duplicate', function () {
      alert('该用户名已被使用。');
      document.getElementById("btnSend").disabled = true;
      document.getElementById("btnLogout").disabled = true;
      document.getElementById("btnLogin").disabled = "";
    });
  });
  socket.on('error', function (err) {
    AddMsg('与聊天服务器之间的连接发生错误。');
    socket.disconnect();
    socket.removeAllListeners('connect');
    io.sockets = {};
  });
  socket.emit('login', userName);
  document.getElementById("btnSend").disabled = '';
  document.getElementById("btnLogout").disabled = '';
  document.getElementById("btnLogin").disabled = true;
}
function btnSend_onclick() {
  var msg = tbxMsg.value;
  if (msg.length > 0) {
    socket.emit('chat', { user: userName, msg: msg });
    tbxMsg.value = '';
  }
}
function btnLogout_onclick() {
  socket.emit('logout', userName);
  socket.disconnect();
  socket.removeAllListeners('connect'
  );
  io.sockets = {};
  AddMsg("用户" + userName + "退出聊天室: ");
  var divRight = document.getElementById("divRight");
  divRight.innerHTML = "用户列表";
  document.getElementById("btnSend").disabled = "disabled";
  document.getElementById("btnLogout").disabled = "disabled";
  document.getElementById("btnLogin").disabled = "";
}
function window_onunload() {
  socket.emit('logout', userName);
  socket.disconnect();
}
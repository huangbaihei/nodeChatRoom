// io变量从socket.io/socket.io.js中获取，没有使用模块打包工具所以只能在html用script标签引入，不能用require
var divChat, tbxUsername, tbxMsg, divRight, btnSend, btnLogout, btnLogin; // 节点变量
var userName, socket;

function window_onload() { // 页面加载完成后触发
  divChat = document.getElementById('divchat');
  tbxUsername = document.getElementById('tbxUsername');
  tbxMsg = document.getElementById('tbxMsg');
  divRight = document.getElementById("divRight");
  btnSend = document.getElementById("btnSend");
  btnLogout = document.getElementById("btnLogout");
  btnLogin = document.getElementById("btnLogin");
  tbxUsername.focus();
  tbxUsername.select();
}

function AddMsg(msg) {
  divChat.innerHTML += msg + '<br>';
  if (divChat.scrollHeight > divChat.clientHeight)
    divChat.scrollTop = divChat.scrollHeight - divChat.clientHeight; // 让滚动条一直在底部
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
    socket.on('login', function (name) { // 监听登入
      AddMsg('欢迎用户' + name + '进入聊天室。');
    });
    socket.on('sendClients', function (names) { // 监听用户列表
      var str = "";
      names.forEach(function (name) {
        str += name + "<br/>"
      });
      divRight.innerHTML = "用户列表<br/>";
      divRight.innerHTML += str;
    });
    socket.on('chat', function (data) { // 监听聊天消息
      AddMsg(data.user + '说:' + data.msg);
    });
    socket.on('disconnect', function () { // 监听连接断开
      AddMsg('与聊天服务器的连接已断开。');
      btnSend.disabled = true;
      btnLogout.disabled = true;
      btnLogin.disabled = "";
      divRight.innerHTML = "用户列表";
    });
    socket.on('logout', function (name) { // 监听登出
      AddMsg('用户' + name + '已退出聊天室。');
    });
    socket.on('duplicate', function () { // 监听重复用户名
      alert('该用户名已被使用。');
      btnSend.disabled = true;
      btnLogout.disabled = true;
      btnLogin.disabled = "";
    });
  });
  socket.on('error', function (err) { // 监听连接错误
    AddMsg('与聊天服务器之间的连接发生错误。');
    socket.disconnect();
    socket.removeAllListeners('connect');
    io.sockets = {};
  });
  socket.emit('login', userName);
  btnSend.disabled = '';
  btnLogout.disabled = '';
  btnLogin.disabled = true;
}

function btnSend_onclick() {
  var msg = tbxMsg.value;
  if (msg.length > 0) {
    socket.emit('chat', {
      user: userName,
      msg: msg
    });
    tbxMsg.value = '';
  }
}

function btnLogout_onclick() {
  socket.emit('logout', userName);
  socket.disconnect();
  socket.removeAllListeners('connect');
  io.sockets = {};
  AddMsg("用户" + userName + "退出聊天室: ");
  divRight.innerHTML = "用户列表";
  btnSend.disabled = "disabled";
  btnLogout.disabled = "disabled";
  btnLogin.disabled = "";
}

function window_onunload() { // 关闭窗口时触发
  socket.emit('logout', userName);
  socket.disconnect();
}
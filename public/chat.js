console.log("connected");
var socket = io.connect("http://localhost:8000");

//Dom selection

const output   = document.querySelector('.output'),
      message  = document.querySelector('#message'),
      button   = document.querySelector('#msg_btn'),
      feedback = document.querySelector('.feedback'),
      username = document.querySelector('.username'),
      groupId  = document.querySelector('.groupId');

// Emit events

button.addEventListener('click',function () {
  socket.emit('chat',groupId.innerText+" "+message.value);
  console.log("message sent");
});

function newUser() {
  console.log("reached at new user emit");
  socket.emit('new_user',username.innerText);
}

// Listening for data

socket.on('chat',function (data) {
  console.log("message recieved",data);
  feedback.innerHTML = "";
  output.innerHTML += `<p>${data}</p>`;
  message.value = "";
});
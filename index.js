require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const app = express();
app.set('view engine', 'ejs');


app.get('/',(req, res) => {
    res.render('home');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/chat',(req, res) => {
    res.render('chat');
})


const PORT = process.env.PORT || 8080;
const httpServer = app.listen(PORT, () => {
    console.log('http://localhost:'+PORT);
})

const io = socketio(httpServer);

io.on('connection', client => {
    console.log(`Client ${client.id} connected`);
    client.free = true;
    client.loginAt = new Date().toLocaleTimeString(); //Khởi tạo thời gian kết nối  

    client.on('disconnect', () => {
        console.log(`${client.id} has left`);

        //Thông báo cho các user còn lại trước khi mình thoát
        client.broadcast.emit('user-leave', client.id);
        
    });

    client.on('register-name', username => {
        client.username = username;

        //Gửi thông tin đăng kí cho tất cả người dùng
        client.broadcast.emit('register-name', {id: client.id, username: username})
    })


    
    // client.on('message', m => {
    //     console.log(`Tin nhắn từ client với id ${client.id} là: ${m}`);
    // })
    // client.send('Hello! this message was sent from server');
    let users = Array.from(io.sockets.sockets.values())
                .map(socket => ({id: socket.id, name: socket.username}));
    console.log(users);

    //Gửi danh sách user đang online cho người mới
    client.emit('list-users', users);

    //Gửi thông tin người mới cho tất người cũ trước đó
    client.broadcast.emit('new-user', {id: client.id, username: client.username, free: client.free, loginAt: client.loginAt})

})
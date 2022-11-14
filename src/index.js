const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
// const { Socket } = require('dgram');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('../src/utils/messages.js')
const { addUser, getUser, getUserInRoom, removeUser } = require('./utils/users')

const app = express();
const server = http.createServer(app);

const io = socketio(server);

const publicFolderPath = path.join(__dirname, '../public');
console.log(publicFolderPath);

app.use(express.static(publicFolderPath));

let count = 0;
let msg = 'Welcome user';

io.on('connection', (socket) => {
    console.log("New websocket connection!");


    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error)
        }

        socket.join(user.room);
        socket.emit('welcomeMessage', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('notify', generateMessage('Admin', `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback();

    })

    socket.on('msg', (data, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(data)) {
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, data));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('disconnectMessage', generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (data, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('sendLoc', generateLocationMessage(user.username, `https://google.com/maps?q=${data.latitude},${data.longitude}`));
        callback();
    })
})

const port = process.env.PORT || 3000;

server.listen(port, console.log(`Server running on ${port} port`))
// server/index.js
import dotenv from 'dotenv';
dotenv.config();
import express, { response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import harperSaveMessage from './services/harper-save-message.js';
import harperGetMessage from './services/harper-get-message.js';
import leaveRoom from './utils/leave-room.js';
import cors from 'cors';

const app = express();
app.use(cors()); //add cors middleware

const server = createServer(app);


// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server,{
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET','POST']
    },
});


const CHAT_BOT = 'ChatBot';
let chatRoom = '';
let allUsers = [];

// Listen for when the client connects via socket.io-client
io.on('connection',(socket) => {
    console.log(`User connected ${socket.id}`);

        // Add a user to room
        socket.on('join_room', (data) => {
            const {username, room} = data;
            socket.join(room);

        let __createdtime__ = Date.now();

        // Send message to all users currently in the room, apart from the user that just joined
        socket.to(room).emit('receive_message', {
            message: `${username} has joined the ${room} chat room`,
            username: CHAT_BOT,
            __createdtime__
        });

        // Send welcome msg to user that just joined chat only
        socket.emit('receive_message', {
            message: `Welcome ${username}`,
            username: CHAT_BOT,
            __createdtime__
        });

        // Save the new user to the room
        chatRoom = room;
        allUsers.push({id: socket.id,username,room});
        let chatRoomUsers = allUsers.filter((user) => user.room === room);
        socket.to(room).emit('chatroom_users',chatRoomUsers);
        socket.emit('chatroom_users',chatRoomUsers);

        // Send message to each other 
        socket.on('send_message', (data) => {
            const { message, username, room, __createdtime__} = data;
            io.in(room).emit('receive_message',data); // Send to all users in room, including sender
            harperSaveMessage(message, username, room, __createdtime__)
                .then((response) => console.log(response))
                .catch((err) => console.log(err))
        });

        // Get last 100 messages sent in the chat room
        harperGetMessage(room)
            .then((last100Messages) => {
                socket.emit('last_100_messages',last100Messages);
            })
            .catch((err) => console.log(err))
        });

        //remove user from memory when leave room
        socket.on('leave_room', (data) => {
            const { username, room } = data;
            socket.leave(room);
            const __createdtime__ = Date.now();

            allUsers= leaveRoom(socket.id,allUsers);
            socket.to(room).emit('chatroom_users',allUsers);
            socket.to(room).emit('receive_message',{
                username: CHAT_BOT,
                message: `${username} has left the chat`,
                __createdtime__
            });
            console.log(`${username} has left the chat`);
        });

        //remove a user from memory when they disconnect
        socket.on('disconnect',() => {
            console.log('User disconnected from the chat');
            const user = allUsers.find((user) => user.id == socket.id);
            if(user?.username){
                allUsers = leaveRoom(socket.id,allUsers);
                socket.to(chatRoom).emit('chatroom_users',allUsers);
                socket.to(chatRoom).emit('receive_message',{
                    message: `${user.username} has disconnected from the chat.`
                });
            }
        });

});

app.get('/',(req , res) => {
    res.send('Hello World');
});

server.listen(4000,() => {
    console.log('Server is running on port 4000');
});
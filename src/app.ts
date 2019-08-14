import path from 'path';
import http from 'http';
import express from 'express';
import socketio from 'socket.io';
import Filter from 'bad-words';
import { generateMessage, generateLocationMessage } from './utils/messages';
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  console.log('New WebSocket connection');

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    if (user) {
      socket.join(user.room);

      socket.emit('message', generateMessage('Admin', 'Welcome!'));
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          generateMessage('Admin', `${user.username} has joined!`)
        );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(parseInt(socket.id));
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }
    if (user) {
      io.to(user.room).emit('message', generateMessage(user.username, message));
    }
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(parseInt(socket.id));
    if (user) {
      io.to(user.room).emit(
        'locationMessage',
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        )
      );
    }
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(parseInt(socket.id));

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}!`);
});

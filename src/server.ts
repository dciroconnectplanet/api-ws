import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { CLIENT_URL } from './config';
import routes from './infrastructure/router';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: CLIENT_URL,
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static('tmp'));

app.use(`/`, routes);
app.get('/ping', (req, res) => {
  res.json({ pong: 'pong' });
});

io.on('connection', (socket) => {
  console.log({ socketId: socket.id });
  socket.on('message', (body) => {
    console.log({ body });
    socket.emit('')
  });
});

export { server, io };

import Koa from 'koa';
import Io from 'koa-socket-2';
import DarkwireRoom from './Room.js';

const app = new Koa();
const io = new Io();
const rooms = [];

const PORT = process.env.PORT || 3000;

io.attach(app);

io.on('message', (ctx, data) => {
  console.log('client sent data to message endpoint', data);
});

io.on('join-room', (ctx, data) => {
  const { id, username } = data;
  const roomExists = rooms.find(room => {
    if (room.id === id) {
      return room;
    }
  });

  const roomIo = new Io(id);
  console.log(roomExists);


  const room = new DarkwireRoom(roomIo, id);

  console.log(room);
});

app.use(async ctx => {
  ctx.body = { ready: true };
});

app.listen(PORT);
console.log(`Darkwire is online at port ${PORT}`);

import Koa from 'koa';
import Io from 'socket.io';
import KoaBody from 'koa-body';
import cors from 'kcors';
import Router from 'koa-router';
import DarkwireRoom from './Room.js';
import http from 'http';

const app = new Koa();
const server = http.createServer(app.callback())
server.listen(3000);

const router = new Router();
const koaBody = new KoaBody();
const rooms = [];

const PORT = process.env.PORT || 3000;

const io = Io(server);

app.use(cors({
  credentials: true,
}));
router.post('/handshake', koaBody, (ctx) => {
  const { body } = ctx.request;
  const { roomId } = body;
  let ready = false;

  const roomExists = rooms.find((room) => room.id === roomId);
  
  if (!roomExists) {
    const room = new DarkwireRoom(io, roomId);
    rooms.push(room);
  }

  ready = true;

  ctx.body = {
    id: roomId,
    ready,
  };
});

app.use(router.routes());

app.use(async ctx => {
  ctx.body = { ready: true };
});

console.log(`Darkwire is online at port ${PORT}`);

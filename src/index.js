import Koa from 'koa';
import Io from 'koa-socket-2';
import KoaBody from 'koa-body';
import cors from 'kcors';
import Router from 'koa-router';
import DarkwireRoom from './Room.js';

const app = new Koa();
const router = new Router();
const koaBody = new KoaBody();
const rooms = [];

const PORT = process.env.PORT || 3000;

app.use(cors());
router.post('/handshake', koaBody, (ctx) => {
  const { body } = ctx.request;
  const { id } = body;
  let ready = false;

  const roomExists = rooms.find((room) => room.id === id);
  
  if (!roomExists) {
    const io = new Io(id);
    const room = new Room(io, id);
    rooms.push(room);
  }

  ready = true;

  ctx.body = {
    id: id,
    ready,
  };
});

app.use(router.routes());

app.use(async ctx => {
  ctx.body = { ready: true };
});

app.listen(PORT);
console.log(`Darkwire is online at port ${PORT}`);

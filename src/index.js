import http from 'http';
import https from 'https';
import Koa from 'koa';
import Io from 'socket.io';
import KoaBody from 'koa-body';
import cors from 'kcors';
import Router from 'koa-router';
import DarkwireRoom from './Room.js';
import config from './config';
import bluebird from 'bluebird';
import Redis from 'redis';
import socketRedis from 'socket.io-redis';

bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);

const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
})

const env = process.env.NODE_ENV || 'development';

const app = new Koa();
const PORT = process.env.PORT || 3000;

const router = new Router();
const koaBody = new KoaBody();
const rooms = [];

function removeRoomId(room) {
  const roomIndex = rooms.indexOf(room);
  if (roomIndex > -1) {
    rooms.splice(roomIndex, 1);
  }
}

app.use(cors({
  credentials: true,
}));

const fetchRooms = async () => {
  const res = await redis.hgetallAsync('rooms')
  Object.keys(res || {}).forEach(key => {
    const val = JSON.parse(res[key])
    const room = new DarkwireRoom({
      io,
      removeRoomId,
      redis,
      users: val.users,
      id: val.id,
      isLocked: val.isLocked,
    });
    rooms.push(room);
  })
}

router.post('/handshake', koaBody, (ctx) => {
  const { body } = ctx.request;
  const { roomId } = body;
  let ready = false;

  const roomExists = rooms.find((room) => room.id === roomId);

  if (!roomExists) {
    const room = new DarkwireRoom({
      io,
      removeRoomId,
      redis,
      id: roomId,
    });
    rooms.push(room);
  }

  ready = true;

  ctx.body = {
    id: roomId,
    ready,
    isLocked: Boolean(roomExists && roomExists.isLocked),
    size: ((roomExists && roomExists.users.length) || 0) + 1,
    version: config.version,
    sha: config.sha,
  };
});

app.use(router.routes());

app.use(async ctx => {
  ctx.body = { ready: true };
});

const protocol = (process.env.PROTOCOL || 'http') === 'http' ? http : https;

const server = protocol.createServer(app.callback());
const io = Io(server);
io.adapter(socketRedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
}));

const init = async () => {
  await fetchRooms()

  server.listen(PORT, () => {
    console.log(`Darkwire is online at port ${PORT}`);
  });
}

init()


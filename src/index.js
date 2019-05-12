require('dotenv').config()
import http from 'http';
import https from 'https';
import Koa from 'koa';
import Io from 'socket.io';
import KoaBody from 'koa-body';
import cors from 'kcors';
import Router from 'koa-router';
import config from './config';
import bluebird from 'bluebird';
import Redis from 'redis';
import socketRedis from 'socket.io-redis';
import Socket from './socket';
import crypto from 'crypto'
import mailer from './utils/mailer';

if (typeof process.env.ROOM_HASH_SECRET === 'undefined') {
  throw new Error('ROOM_HASH_SECRET environment variable is required. We recommend using a 128 bit UUID.')
}

bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);

const redis = Redis.createClient(process.env.REDIS_URL)

export const getRedis = () => redis

const env = process.env.NODE_ENV || 'development';

const app = new Koa();
const PORT = process.env.PORT || 3000;

const router = new Router();
const koaBody = new KoaBody();

app.use(require('koa-static')('darkwire-client/build'));

app.use(cors({
  credentials: true,
}));

router.post('/handshake', koaBody, async (ctx) => {
  const { body } = ctx.request;
  const { roomId } = body;

  const roomIdHash = getRoomIdHash(roomId)

  let roomExists = await redis.hgetAsync('rooms', roomIdHash)
  if (roomExists) {
    roomExists = JSON.parse(roomExists)
  }

  ctx.body = {
    id: roomId,
    ready: true,
    isLocked: Boolean(roomExists && roomExists.isLocked),
    size: ((roomExists && roomExists.users.length) || 0) + 1,
    version: config.version,
    sha: config.sha,
  };
});

router.post('/abuse/:roomId', koaBody, async (ctx) => {
  let { roomId } = ctx.params;

  roomId = roomId.trim();

  if (process.env.ABUSE_FROM_EMAIL_ADDRESS && process.env.ABUSE_TO_EMAIL_ADDRESS) {
    const abuseForRoomExists = await redis.hgetAsync('abuse', roomId);
    if (!abuseForRoomExists) {
      mailer.send({
        from: process.env.ABUSE_FROM_EMAIL_ADDRESS,
        to: process.env.ABUSE_TO_EMAIL_ADDRESS,
        subject: 'Darkwire Abuse Notification',
        text: `Room ID: ${roomId}`
      });
    }
  }
  
  await redis.hincrbyAsync('abuse', roomId, 1);

  ctx.status = 200;
});

app.use(router.routes());

app.use(async ctx => {
  ctx.body = { ready: true };
});

const protocol = (process.env.PROTOCOL || 'http') === 'http' ? http : https;

const server = protocol.createServer(app.callback());
const io = Io(server);
io.adapter(socketRedis(process.env.REDIS_URL));

const getRoomIdHash = (id) => {
  if (env === 'development') {
    return id
  }
  return crypto
    .createHmac('sha256', process.env.ROOM_HASH_SECRET)
    .update(id)
    .digest('hex')
}

export const getIO = () => io

io.on('connection', async (socket) => {
  const roomId = socket.handshake.query.roomId

  const roomIdHash = getRoomIdHash(roomId)

  let room = await redis.hgetAsync('rooms', roomIdHash)
  room = JSON.parse(room || '{}')

  new Socket({
    roomId: roomIdHash,
    socket,
    room,
  })
})

const init = async () => {
  server.listen(PORT, () => {
    console.log(`Darkwire is online at port ${PORT}`);
  })
}

init()


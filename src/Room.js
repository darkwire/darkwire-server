import _ from 'lodash';
import uuid from 'uuid/v4';

export default class Room {
  constructor(opts) {
    const { id, io, redis, removeRoomId, isLocked, users } = opts
    this._id = id;
    this._io = io;
    this._users = users || [];
    this.selfDestruct = removeRoomId;
    this._isLocked = isLocked || false;

    const room = io.of(`/${id}`);
    this._room = room
    this._redis = redis
    this._createdAt = Date.now()
    this._updatedAt = Date.now()

    this._room.on('connection', socket => this.handleSocket(socket));
  }

  serialize() {
    return {
      id: this._id,
      users: this._users,
      isLocked: this._isLocked,
      createdAt: this._createdAt,
    }
  }

  getRoomKey() {
    return `room:${this._id}`
  }

  async save() {
    const json = {
      ...this.serialize(),
      updatedAt: Date.now(),
    }

    return this._redis.hsetAsync('rooms', this._id, JSON.stringify(json))
  }

  async destroy() {
    return this._redis.hdel('rooms', this._id)
  }

  handleSocket(socket) {
    if (this.isLocked) {
      return socket.disconnect('LOCKED');
    }

    socket.join(this._room.name)

    socket.on('PAYLOAD', (payload) => {
      socket.to(this._room.name).emit('PAYLOAD', payload);
    });

    socket.on('USER_ENTER', async payload => {
      this._users.push({
        socketId: socket.id,
        publicKey: payload.publicKey,
        isOwner: this._users.length === 0,
      })
      await this.save()
      this._room.emit('USER_ENTER', this._users.map(u => ({
        publicKey: u.publicKey,
        isOwner: u.isOwner,
      })));
    })

    socket.on('TOGGLE_LOCK_ROOM', async (data, callback) => {
      const user = this._users.find(u => u.socketId === socket.id && u.isOwner)

      if (!user) {
        callback({
          isLocked: this.isLocked,
        })
        return
      }

      this.isLocked = !this.isLocked;

      await this.save()

      socket.to(this._room.name).emit('TOGGLE_LOCK_ROOM', {
        locked: this.isLocked,
        publicKey: user && user.publicKey
      });

      callback({
        isLocked: this.isLocked,
      })
    });

    socket.on('disconnect', () => this.handleDisconnect(socket));
    this.save()
  }

  async handleDisconnect(socket) {
    const disconnectedUser = this._users.find(u => u.socketId === socket.id)
    this._users = this._users.filter(u => u.socketId !== socket.id).map((u, index) => ({
      ...u,
      isOwner: index === 0,
    }))

    await this.save()

    socket.leave(this._room.name)

    socket.to(this._room.name).emit('USER_EXIT', this._users.map(u => ({
      publicKey: u.publicKey,
      isOwner: u.isOwner,
    })));

    if (this._users.length === 0) {
      this._room.removeAllListeners('connection')
      await this.destroy()
      return this.selfDestruct(this);
    }
  }

  get id() {
    return this._id;
  }

  get io() {
    return this.io;
  }

  get users() {
    return this._users;
  }

  set isLocked(isLocked) {
    this._isLocked = isLocked;
    return this;
  }

  get isLocked() {
    return this._isLocked;
  }

}

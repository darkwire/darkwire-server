import _ from 'lodash';
import uuid from 'uuid/v4';

export default class Room {
  constructor(io = null, id = {}, removeRoomId) {
    this._id = id;
    this._io = io;
    this._users = [];
    this.selfDestruct = removeRoomId;
    this._isLocked = false;

    const room = io.of(`/${id}`);
    this._room = room

    this._room.on('connection', socket => this.handleSocket(socket));
  }

  handleSocket(socket) {
    if (this.isLocked) {
      return socket.disconnect('LOCKED');
    }

    socket.join(this._room.name)

    console.log('connected', this._users.length);
    socket.on('PAYLOAD', (payload) => {
      socket.to(this._room.name).emit('PAYLOAD', payload);
    });

    socket.on('USER_ENTER', payload => {
      this._users.push({
        socketId: socket.id,
        publicKey: payload.publicKey
      })
      this._room.emit('USER_ENTER', this._users.map(u => u.publicKey));
    })

    socket.on('TOGGLE_LOCK_ROOM', data => {
      this.isLocked = !this.isLocked;
      const user = this._users.find(u => u.socketId === socket.id)
      
      socket.to(this._room.name).emit('TOGGLE_LOCK_ROOM', {
        locked: this.isLocked,
        publicKey: user && user.publicKey
      });
    });

    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  handleDisconnect(socket) {
    const disconnectedUser = this._users.find(u => u.socketId === socket.id)
    this._users = this._users.filter(u => u.socketId !== socket.id)

    socket.leave(this._room.name)

    socket.to(this._room.name).emit('USER_EXIT', {
      publicKey: disconnectedUser && disconnectedUser.publicKey
    });

    console.log('disconnected', this._users);
    if (this._users.length === 0) {
      this._room.removeAllListeners('connection')
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

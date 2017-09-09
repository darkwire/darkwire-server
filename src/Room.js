import _ from 'lodash';
import uuid from 'uuid/v4';

export default class Room {
  constructor(io = null, id = {}) {
    this._id = id;
    this._io = io;
    this.users = [];

    const room = io.of(`/${id}`);
    room.on('connection', socket => this.handleSocket(socket));
  }

  handleSocket(socket) {
    console.log('connected');
    let addedUser = false;

    socket.on('PAYLOAD', payload => {
      socket.broadcast.emit('PAYLOAD', payload);
    });

  }

  get id() {
    return this._id;
  }

  get io() {
    return this.io;
  }
}

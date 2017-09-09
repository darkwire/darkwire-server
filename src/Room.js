import _ from 'lodash';
import uuid from 'uuid/v4';

export default class Room {
  constructor(io = null, id = {}) {
    this._id = id;
    this._io = io;
    this.users = [];
    this._io.on('connection', socket => this.handleSocket(socket));
  }

  handleSocket(socket) {
    console.log('connected');
    let addedUser = false;

    socket.on('SEND_MESSAGE', data => {
      console.log(data);
    });

    socket.on('typing', () => {
      socket.broadcast.emit('typing', { username: socket.username });
    });

    socket.on('stopped-typing', () => {
      socket.broadcast.emit('stopped-typing', { username: socket.username })
    });
  }

  get id() {
    return this._id;
  }

  get io() {
    return this.io;
  }
}

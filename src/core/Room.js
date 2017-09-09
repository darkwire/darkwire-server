import _ from 'lodash';
import uuid from 'uuid/v4';

export default class Room {
  constructor(io = null, id = {}) {
    this._id = id;
    this.io = io.of(this._id);
    this.users = [];
    this.io.on('connection', socket => this.handleSocket(socket));
  }

  handleSocket(socket) {
    socket.on('typing', () => {
      socket.broadcast.emit('typing', { username: socket.username });
    });
  }
}

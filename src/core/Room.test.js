import Room from './Room.js';

describe('darkwire Room', () => {

  test('has an ID', () => {
    const room = new Room('test');
    expect(room._id).toBeDefined();
  });

});

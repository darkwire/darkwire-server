import Koa from 'koa';
import IO from 'koa-socket-2';

const app = new Koa();
const io = new IO();

const PORT = process.env.PORT || 3000;

io.attach(app);

io.on('message', (ctx, data) => {
  console.log('client sent data to message endpoint', data);
});

app.listen(PORT);

console.log(`Darkwire is online at port ${PORT}`);

import Jimp from 'jimp';
import { httpServer } from './src/http_server/index.js';
// import robot from 'robotjs';
import { WebSocketServer } from 'ws';

const HTTP_PORT = 3000;
const WS_PORT = 8000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log(`Start web socket server on the ${WS_PORT} port!`);
const wsServer = new WebSocketServer({ port: WS_PORT });
wsServer.on('connection', onConnect);

function onConnect(wsClient) {
  console.log('Новый пользователь');

  wsClient.on('message', function (message) {
    const commad = message.toString().split(' ');
    console.log(commad);
    switch (commad[0]) {
      case 'mouse_up': {
        break;
      }
      case 'mouse_down': {
        break;
      }
      case 'mouse_left': {
        break;
      }
      case 'mouse_right': {
        break;
      }
      case 'mouse_position': {
        const x = 100;
        const y = 200;
        wsClient.send(`mouse_position ${x},${y}`);
        break;
      }
      case 'draw_circle': {
        break;
      }
      case 'draw_rectangle': {
        break;
      }
      case 'draw_square': {
        break;
      }
      case 'prnt_scrn': {
        const buffer = '';
        wsClient.send(new Buffer.from(buffer).toString('base64'));
        break;
      }
    }
  });

  wsClient.on('close', function () {
    console.log('Пользователь отключился');
  });
}

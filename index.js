// import Jimp from 'jimp';
import { httpServer } from './src/http_server/index.js';
import robot from 'robotjs';
import { WebSocketServer } from 'ws';

const HTTP_PORT = 3000;
const WS_PORT = 8000;
const SCREEN_SIZE = 200;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log(`Start web socket server on the ${WS_PORT} port!`);
const wsServer = new WebSocketServer({ port: WS_PORT });
wsServer.on('connection', onConnect);

function getPos(deltaX = 0, deltaY = 0, deltaWidth = 0, deltaHeight = 0) {
  const mousePos = robot.getMousePos();
  const x = Math.min(mousePos.x + deltaX, 0);
  const y = Math.min(mousePos.y + deltaY, 0);

  const screenSize = robot.getScreenSize();
  const width = Math.min(mousePos.x + deltaWidth, screenSize.width);
  const height = Math.min(mousePos.y + deltaHeight, screenSize.height);

  return { x, y, width, height };
}

function parseDelta(value) {
  const delta = Number.parseInt(value);
  return Number.isNaN(delta) ? 0 : delta;
}

function onConnect(wsClient) {
  console.log('Новый пользователь');

  wsClient.on('message', function (message) {
    const commad = message.toString().split(' ');
    console.log(commad);
    switch (commad[0]) {
      case 'mouse_up': {
        const mousePos = robot.getMousePos();
        robot.moveMouse(mousePos.x, mousePos.y - parseDelta(commad[1]));
        break;
      }
      case 'mouse_down': {
        const mousePos = robot.getMousePos();
        robot.moveMouse(mousePos.x, mousePos.y + parseDelta(commad[1]));
        break;
      }
      case 'mouse_left': {
        const mousePos = robot.getMousePos();
        robot.moveMouse(mousePos.x - parseDelta(commad[1]), mousePos.y);
        break;
      }
      case 'mouse_right': {
        const mousePos = robot.getMousePos();
        robot.moveMouse(mousePos.x + parseDelta(commad[1]), mousePos.y);
        break;
      }
      case 'mouse_position': {
        const { x, y } = robot.getMousePos();
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
        const mousePos = robot.getMousePos();
        const x = Math.min(mousePos.x, 0);
        const y = Math.min(mousePos.y, 0);

        const screenSize = robot.getScreenSize();
        const width = Math.min(mousePos.x + SCREEN_SIZE, screenSize.width);
        const height = Math.min(mousePos.y + SCREEN_SIZE, screenSize.height);

        const bitmap = robot.screen.capture(x, y, width, height);
        wsClient.send(bitmap.image.toString('base64'));
        break;
      }
    }
  });

  wsClient.on('close', function () {
    console.log('Пользователь отключился');
  });
}

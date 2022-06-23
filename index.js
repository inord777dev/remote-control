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
  const x = Math.max(mousePos.x + deltaX, 0);
  const y = Math.max(mousePos.y + deltaY, 0);

  const screenSize = robot.getScreenSize();
  const width = Math.min(mousePos.x + deltaWidth, screenSize.width);
  const height = Math.min(mousePos.y + deltaHeight, screenSize.height);

  return { x, y, width, height };
}

function parseValue(value) {
  const x = Number.parseInt(value);
  return Number.isNaN(x) ? 0 : x;
}

function drawRect(width, height) {
  const pos = getPos(0, 0, width, height);
  robot.setMouseDelay(200);
  robot.mouseToggle('down');
  robot.moveMouse(pos.width, pos.y);
  robot.moveMouse(pos.width, pos.height);
  robot.moveMouse(pos.x, pos.height);
  robot.moveMouse(pos.x, pos.y);
  robot.mouseToggle('up');
}

function onConnect(wsClient) {
  console.log('Новый пользователь');

  wsClient.on('message', function (message) {
    const commad = message.toString().split(' ');
    console.log(commad);
    switch (commad[0]) {
      case 'mouse_up': {
        const { x, y } = getPos(0, -parseValue(commad[1]));
        robot.moveMouse(x, y);
        break;
      }
      case 'mouse_down': {
        const { x, y } = getPos(0, parseValue(commad[1]));
        robot.moveMouse(x, y);
        break;
      }
      case 'mouse_left': {
        const { x, y } = getPos(-parseValue(commad[1]));
        robot.moveMouse(x, y);
        break;
      }
      case 'mouse_right': {
        const { x, y } = getPos(parseValue(commad[1]));
        robot.moveMouse(x, y);
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
        const width = parseValue(commad[1]);
        const height = parseValue(commad[2]);
        drawRect(width, height);
        break;
      }
      case 'draw_square': {
        const width = parseValue(commad[1]);
        drawRect(width, width);
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

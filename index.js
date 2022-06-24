import { WebSocketServer } from 'ws';
import Jimp from 'jimp';
import robot from 'robotjs';
import { httpServer } from './src/http_server/index.js';

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
        const radius = parseValue(commad[1]);
        const { x, y } = getPos(0, radius);
        robot.setMouseDelay(2);
        robot.mouseToggle('down');
        for (let gradus = -90; gradus <= 270; gradus += 1) {
          const currentAngle = (gradus * Math.PI) / 180;
          const deltaX = Math.cos(currentAngle) * radius;
          const deltaY = Math.sin(currentAngle) * radius;
          robot.moveMouse(x + deltaX, y + deltaY);
        }
        robot.mouseToggle('up');
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
        const { x, y, width, height } = getPos(
          -SCREEN_SIZE / 2,
          -SCREEN_SIZE / 2
        );
        var picture = robot.screen.capture(x, y, SCREEN_SIZE, SCREEN_SIZE);
        var image = new Jimp(picture.width, picture.height, function (
          err,
          img
        ) {
          img.bitmap.data = picture.image;
          img.getBuffer(Jimp.MIME_PNG, (err, png) => {
            image.getBase64(Jimp.MIME_PNG, (err, value) => {
              wsClient.send(
                `prnt_scrn ${value.replace('data:image/png;base64,', '')}`
              );
            });
          });
        });
        break;
      }
    }
  });

  wsClient.on('close', function () {
    console.log('Пользователь отключился');
  });
}

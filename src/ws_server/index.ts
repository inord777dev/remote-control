import 'dotenv/config';
import { WebSocketServer } from 'ws';
import robot from 'robotjs';
import Jimp from 'jimp';
import { getPos } from '../helper/helper';
import { parseValue } from '../helper/parser';
import { drawRect, drawCircle } from '../helper/drawer';

const WS_PORT = parseInt(process.env.WS_PORT as string) || 8000;
const SCREEN_SIZE = parseInt(process.env.SCREEN_SIZE as string) || 200;

export const wsServerStart = () => {
  const wsServer = new WebSocketServer({ port: WS_PORT });

  wsServer.on('connection', function onConnect(wsClient) {
    console.log('Hi user');

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
          drawCircle(radius);
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
      console.log('Bay user');
    });
  });

  console.log(`Start web socket server on the ${WS_PORT} port!`);
}
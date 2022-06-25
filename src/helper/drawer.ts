import robot from 'robotjs';
import { getPos } from './helper';

export function drawRect(width: number, height: number) {
  const pos = getPos(0, 0, width, height);
  robot.setMouseDelay(200);
  robot.mouseToggle('down');
  robot.moveMouseSmooth(pos.width, pos.y);
  robot.moveMouseSmooth(pos.width, pos.height);
  robot.moveMouseSmooth(pos.x, pos.height);
  robot.moveMouseSmooth(pos.x, pos.y);
  robot.mouseToggle('up');
}

export function drawCircle(radius: number) {
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
}

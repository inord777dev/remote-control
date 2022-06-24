import robot from 'robotjs';

export function getPos(deltaX = 0, deltaY = 0, deltaWidth = 0, deltaHeight = 0) {
  const mousePos = robot.getMousePos();
  const x = Math.max(mousePos.x + deltaX, 0);
  const y = Math.max(mousePos.y + deltaY, 0);

  const screenSize = robot.getScreenSize();
  const width = Math.min(mousePos.x + deltaWidth, screenSize.width);
  const height = Math.min(mousePos.y + deltaHeight, screenSize.height);

  return { x, y, width, height };
}

export function drawRect(width: number, height: number) {
  const pos = getPos(0, 0, width, height);
  robot.setMouseDelay(200);
  robot.mouseToggle('down');
  robot.moveMouse(pos.width, pos.y);
  robot.moveMouse(pos.width, pos.height);
  robot.moveMouse(pos.x, pos.height);
  robot.moveMouse(pos.x, pos.y);
  robot.mouseToggle('up');
}
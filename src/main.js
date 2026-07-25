const { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray } = require('electron');
const path = require('path');

const PET_SIZE = 210;
const STEP_INTERVAL_MS = 16;
const SPEED = 1.15;

let petWindow = null;
let movementTimer = null;
let isPaused = false;
let position = null;
let tray = null;
let velocity = {
  x: Math.random() < 0.5 ? SPEED : -SPEED,
  y: Math.random() < 0.5 ? SPEED * 0.48 : -SPEED * 0.48,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCurrentWorkArea() {
  return screen.getDisplayNearestPoint({
    x: Math.round(position.x + PET_SIZE / 2),
    y: Math.round(position.y + PET_SIZE / 2),
  }).workArea;
}

function sendDirection(bounced = false) {
  if (!petWindow || petWindow.isDestroyed() || petWindow.webContents.isLoading()) return;
  petWindow.webContents.send('pet:direction', {
    x: velocity.x,
    y: velocity.y,
    bounced,
  });
}

function movePet() {
  if (!petWindow || petWindow.isDestroyed() || isPaused) return;

  const workArea = getCurrentWorkArea();
  const maxX = workArea.x + workArea.width - PET_SIZE;
  const maxY = workArea.y + workArea.height - PET_SIZE;

  let nextX = position.x + velocity.x;
  let nextY = position.y + velocity.y;
  let bounced = false;

  if (nextX <= workArea.x || nextX >= maxX) {
    velocity.x *= -1;
    nextX = clamp(nextX, workArea.x, maxX);
    bounced = true;
  }

  if (nextY <= workArea.y || nextY >= maxY) {
    velocity.y *= -1;
    nextY = clamp(nextY, workArea.y, maxY);
    bounced = true;
  }

  position = { x: nextX, y: nextY };
  petWindow.setBounds({
    x: Math.round(position.x),
    y: Math.round(position.y),
    width: PET_SIZE,
    height: PET_SIZE,
  });
  if (bounced) sendDirection(true);
}

function startMovementLoop() {
  clearInterval(movementTimer);
  movementTimer = setInterval(movePet, STEP_INTERVAL_MS);
}

function showPet() {
  if (!petWindow || petWindow.isDestroyed()) {
    createPetWindow();
    return;
  }

  petWindow.showInactive();
}

function setPaused(paused) {
  isPaused = Boolean(paused);
  if (petWindow && !petWindow.isDestroyed() && !petWindow.webContents.isLoading()) {
    petWindow.webContents.send('pet:paused', isPaused);
  }
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '\u663e\u793a\u684c\u9762\u840c\u5ba0', click: showPet },
    {
      label: isPaused ? '\u7ee7\u7eed\u6e38\u8d70' : '\u6682\u505c\u6e38\u8d70',
      click: () => setPaused(!isPaused),
    },
    { type: 'separator' },
    { label: '\u9000\u51fa', click: () => app.quit() },
  ]));
}

function createTray() {
  const iconPath = path.join(app.getAppPath(), 'build', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('\u684c\u9762\u840c\u5ba0');
  tray.on('double-click', showPet);
  updateTrayMenu();
}

function createPetWindow() {
  const workArea = screen.getPrimaryDisplay().workArea;
  const initialX = Math.round(workArea.x + workArea.width / 2 - PET_SIZE / 2);
  const initialY = Math.round(workArea.y + workArea.height / 2 - PET_SIZE / 2);
  position = { x: initialX, y: initialY };

  petWindow = new BrowserWindow({
    width: PET_SIZE,
    height: PET_SIZE,
    x: initialX,
    y: initialY,
    transparent: true,
    frame: false,
    focusable: false,
    show: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    minWidth: PET_SIZE,
    maxWidth: PET_SIZE,
    minHeight: PET_SIZE,
    maxHeight: PET_SIZE,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  petWindow.setAlwaysOnTop(true, 'screen-saver');
  petWindow.loadFile(path.join(__dirname, 'renderer', 'index.html')).then(() => {
    if (!petWindow || petWindow.isDestroyed()) return;
    if (petWindow.isMaximized()) petWindow.unmaximize();
    if (petWindow.isFullScreen()) petWindow.setFullScreen(false);
    petWindow.setBounds({
      x: initialX,
      y: initialY,
      width: PET_SIZE,
      height: PET_SIZE,
    });
    petWindow.showInactive();
    sendDirection();
    startMovementLoop();
  }).catch((error) => {
    console.error('Failed to load the desktop pet:', error);
    app.quit();
  });
  petWindow.on('closed', () => {
    clearInterval(movementTimer);
    movementTimer = null;
    petWindow = null;
    position = null;
  });
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', showPet);

  app.whenReady().then(() => {
    app.setAppUserModelId('com.desktop-pet.app');
    createPetWindow();
    createTray();
    app.on('activate', () => {
      if (!BrowserWindow.getAllWindows().length) createPetWindow();
    });
  });
}

ipcMain.on('pet:set-paused', (_event, paused) => {
  setPaused(paused);
});

app.on('window-all-closed', () => app.quit());

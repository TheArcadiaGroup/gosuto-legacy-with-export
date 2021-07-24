/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import server from './server';

let port;
const s = server.listen(0, function() {
  port = s.address().port;
});

log.transports.file.level = 'info';
autoUpdater.logger = log;
const rs = 'https://gosuto-rs.herokuapp.com';
const url = `${rs}/update/${process.platform}/${app.getVersion()}`;

// autoUpdater.setFeedURL(url);
autoUpdater.checkForUpdatesAndNotify();

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};
let deeplinkingUrl;
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  app.on('second-instance', (e, argv) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform === 'win32') {
      // Keep only command line / deep linked arguments
      deeplinkingUrl = argv.slice(1);
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
} else {
  app.quit();
}

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  if (process.platform == 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1)
  }


  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('vault-logo.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, '../src/casperService.js'),
      additionalArguments: [
        'myvarvalue',
        'secondvarvalue',
        '--another=something',
      ],
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html?port=${port}`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const sendStatusToWindow = (text) => {
  log.info(text);
  if (mainWindow) {
    mainWindow.webContents.send('message', text);
  }
};

app.whenReady().then(createWindow).catch(console.log);
app.on('will-finish-launching', function() {
  // Protocol handler for osx
  app.on('open-url', function(event, data) {
    event.preventDefault();
    deeplinkingUrl = data;
    console.log('event!!!');
    console.log(data);
    const sendDeepLinkToWindow = (text): void => {
      log.info(text);
      if (mainWindow) {
        mainWindow.webContents.send('deep-link', text);
      }
    };

    sendDeepLinkToWindow(deeplinkingUrl);
  });

})

// This will catch clicks on links such as <a href="foobar://abc=1">open in foobar</a>

app.setAsDefaultProtocolClient('gosuto');

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for updates...');
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow(`Error in updater ${err.toString()}`);
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  sendStatusToWindow('Update downloaded...');

  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.',
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

autoUpdater.on('update-available', (event, releaseNotes, releaseName) => {
  sendStatusToWindow('Update available...');
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'update-available',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'update-available',
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});


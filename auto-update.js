'use strict';

const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
const {dialog} = require('electron');

autoUpdater.logger = log;

const setUp = (mainWindow) => {

    autoUpdater.on('download-progress', progress => {
        mainWindow.webContents.send('downloadProgress', progress);
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('updateDownloaded', true);
    });

    autoUpdater.checkForUpdates();
};

autoUpdater.autoDownload = false;

autoUpdater.on('error', error => {
    dialog.showErrorBox(
        'Error: ',
        error == null ? 'unknown' : (error.stack || error).toString()
    );
});

autoUpdater.on('update-available', updateInfo => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update verfügbar',
        message: 'Eine neue Version von iDAI.field (' + updateInfo.version + ') ist verfügbar. '
            + 'Möchten Sie sie herunterladen und installieren?',
        buttons: ['Ja', 'Nein']
    }, (buttonIndex) => {
        if (buttonIndex === 0) {
            autoUpdater.downloadUpdate();
        }
    });
});

autoUpdater.on('update-downloaded', updateInfo => {
    dialog.showMessageBox({
        title: 'Update installieren',
        message: 'Version ' + updateInfo.version + ' von iDAI.field wurde geladen. '
            + 'Starten Sie die Anwendung neu, um sie zu installieren.'
    });
});

module.exports = {
    setUp: setUp
};

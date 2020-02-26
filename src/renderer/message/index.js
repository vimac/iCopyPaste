const {ipcRenderer} = require('electron')

export function setWindowTitle (title) {
  ipcRenderer.send('set-window-title', title)
}

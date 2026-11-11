const { contextBridge, ipcRenderer } = require('electron');

let latestPads = [];
const listeners = new Set();

ipcRenderer.on('mac-gamepad-state', (_event, pads) => {
    latestPads = Array.isArray(pads) ? pads : [];
    for (const cb of listeners) {
        try {
            cb(latestPads);
        } catch (_) {}
    }
});

contextBridge.exposeInMainWorld('__macGamepadBridge', {
    getPads: () => latestPads,
    onUpdate: (cb) => {
        listeners.add(cb);
        if (latestPads.length > 0) {
            cb(latestPads);
        }
    }
});

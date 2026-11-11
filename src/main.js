// src/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execFileSync } = require('child_process');

let gamepadHelper = null;
let latestPads = [];

function startMacGamepadHelper(getWindows) {
    if (process.platform !== 'darwin') return;

    const srcPath = path.join(__dirname, 'native', 'mac_gamepad.m');
    const binPath = path.join(__dirname, 'native', 'mac_gamepad');

    try {
        const needsBuild = !fs.existsSync(binPath) ||
            (fs.existsSync(srcPath) && fs.statSync(srcPath).mtimeMs > fs.statSync(binPath).mtimeMs);
        if (needsBuild && fs.existsSync(srcPath)) {
            execFileSync('clang', [
                '-O2',
                '-fobjc-arc',
                '-framework', 'Foundation',
                '-framework', 'AppKit',
                '-framework', 'GameController',
                srcPath,
                '-o', binPath
            ]);
        }
    } catch (err) {
        console.error('[GamepadHelper] Build error:', err.message);
    }

    if (!fs.existsSync(binPath)) return;

    gamepadHelper = spawn(binPath, [], { stdio: ['ignore', 'pipe', 'ignore'] });

    let buffer = '';
    gamepadHelper.stdout.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        let newlineIdx;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);
            if (!line) continue;
            try {
                latestPads = JSON.parse(line);
                for (const win of getWindows()) {
                    if (!win.isDestroyed()) {
                        win.webContents.send('mac-gamepad-state', latestPads);
                    }
                }
            } catch (_) {}
        }
    });

    gamepadHelper.on('exit', () => {
        gamepadHelper = null;
    });
}

function createWindow() {
    const runtime = process.env.REFRACTURE_RUNTIME || process.env.REFRACT_RUNTIME || 'game';
    const defaultPort = runtime === 'lab' ? 3001 : 3000;
    const port = process.env.REFRACTURE_PORT || process.env.REFRACT_PORT || defaultPort;

    const win = new BrowserWindow({
        width: 1500,
        height: 1200,
        title: runtime === 'lab' ? 'Refracture — Lab Suite' : 'Refracture',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.webContents.on('did-finish-load', () => {
        if (latestPads.length > 0 && !win.isDestroyed()) {
            win.webContents.send('mac-gamepad-state', latestPads);
        }
    });

    // LOAD THE VITE SERVER FOR THE SELECTED RUNTIME (3000 = Game, 3001 = Lab)
    win.loadURL(`http://localhost:${port}`);
}

app.whenReady().then(() => {
    startMacGamepadHelper(() => BrowserWindow.getAllWindows());
    createWindow();
});

app.on('will-quit', () => {
    if (gamepadHelper) {
        gamepadHelper.kill();
        gamepadHelper = null;
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
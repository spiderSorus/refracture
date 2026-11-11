import Phaser from 'phaser';
import { runtimeScenes, runtimePipelines } from '@runtime-entry';

if (window.__macGamepadBridge) {
    const nativeGetGamepads = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : () => [];
    const bridgedPads = [null, null, null, null];

    window.__macGamepadBridge.onUpdate((rawPads) => {
        const seenIndices = new Set();

        for (const p of rawPads) {
            const idx = p.index ?? 0;
            if (idx < 0 || idx >= 4) continue;
            seenIndices.add(idx);

            const wasConnected = !!bridgedPads[idx];
            const padObj = {
                id: p.id,
                index: idx,
                connected: true,
                timestamp: performance.now(),
                mapping: p.mapping || 'standard',
                axes: Array.isArray(p.axes) ? p.axes : [0, 0, 0, 0],
                buttons: Array.isArray(p.buttons)
                    ? p.buttons.map(b => ({
                        pressed: !!b.pressed,
                        touched: !!b.pressed,
                        value: typeof b.value === 'number' ? b.value : (b.pressed ? 1 : 0)
                    }))
                    : [],
                vibrationActuator: null
            };
            bridgedPads[idx] = padObj;

            if (!wasConnected) {
                const ev = new Event('gamepadconnected');
                ev.gamepad = padObj;
                window.dispatchEvent(ev);
            }
        }

        for (let i = 0; i < 4; i++) {
            if (bridgedPads[i] && !seenIndices.has(i)) {
                const oldPad = bridgedPads[i];
                oldPad.connected = false;
                bridgedPads[i] = null;
                const ev = new Event('gamepaddisconnected');
                ev.gamepad = oldPad;
                window.dispatchEvent(ev);
            }
        }
    });

    navigator.getGamepads = () => {
        const nativePads = nativeGetGamepads();
        const hasValidNativePad = Array.from(nativePads || []).some(
            p => p && p.connected && ((p.buttons && p.buttons.length > 0) || (p.axes && p.axes.length > 0))
        );
        if (hasValidNativePad) {
            return nativePads;
        }
        const now = performance.now();
        for (let i = 0; i < 4; i++) {
            if (bridgedPads[i]) {
                bridgedPads[i].timestamp = now;
            }
        }
        return bridgedPads;
    };
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#050505',
    transparent: true,
    parent: 'game',
    input: { gamepad: true },
    pipeline: runtimePipelines,
    scene: runtimeScenes
};

window.game = new Phaser.Game(config);
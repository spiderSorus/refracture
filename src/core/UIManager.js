// src/core/UIManager.js

export class UIManager {
    constructor() {
        // Prevent duplicate overlays on HMR refresh
        if (document.getElementById('game-ui-overlay')) {
            this.overlay = document.getElementById('game-ui-overlay');
            return;
        }

        this.overlay = document.createElement('div');
        this.overlay.id = 'game-ui-overlay';
        this.overlay.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 1000; font-family: monospace; color: #fff;
            overflow: hidden;
        `;
        document.body.appendChild(this.overlay);
    }

    showTitle(title = "SCENE", sub = "") {
        const el = document.createElement('div');
        el.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; opacity: 0; transition: opacity 0.5s ease-in-out;
        `;

        el.innerHTML = `
            <h1 style="color: #8b008b; font-size: 64px; margin: 0; font-weight: bold; text-shadow: 2px 2px #000;">
                ${title.toString().toUpperCase()}
            </h1>
            <p style="color: #ff69b4; font-size: 24px; margin: 10px 0 0 0; text-shadow: 1px 1px #000;">
                ${sub.toString()}
            </p>
        `;

        this.overlay.appendChild(el);

        requestAnimationFrame(() => {
            el.style.opacity = '1';
        });

        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 1000);
        }, 3000);
    }

    updateDebug(playerData, stateData) {
        let debugEl = document.getElementById('debug-console');
        if (!debugEl) {
            debugEl = document.createElement('div');
            debugEl.id = 'debug-console';
            debugEl.style.cssText = `
                position: absolute; top: 0; left: 0; width: 320px;
                background: rgba(0,0,0,0.85); padding: 20px;
                display: flex; flex-direction: column; align-items: flex-start;
                font-size: 13px; color: #0f0; visibility: hidden;
                border-bottom: 1px solid #0f0; border-right: 1px solid #0f0;
            `;
            this.overlay.appendChild(debugEl);
        }

        const sling = stateData.sling || { stickX: 0, stickY: 0, vecX: 0, vecY: 0, isCharging: false };

        debugEl.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong style="color: #fff;">[ PLAYER ]</strong><br>
                POS: ${playerData.x}, ${playerData.y}<br>
                STATUS: ${stateData.status}
            </div>
            <div style="color: #ff8400;">
                <strong style="color: #fff;">[ SLINGSHOT ]</strong><br>
                CHARGING: ${sling.isCharging ? 'YES' : 'NO'}<br>
                STICK: ${sling.stickX.toFixed(2)}, ${sling.stickY.toFixed(2)}<br>
                LAST VEC: ${sling.vecX.toFixed(2)}, ${sling.vecY.toFixed(2)}
            </div>
        `;
    }

    toggleDebug() {
        const el = document.getElementById('debug-console');
        if (el) {
            el.style.visibility = (el.style.visibility === 'hidden') ? 'visible' : 'hidden';
        }
    }
}

// Export a singleton instance
export const UI = new UIManager();
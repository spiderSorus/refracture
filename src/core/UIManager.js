// src/core/UIManager.js

export class UIManager {
    constructor() {
        if (typeof document === 'undefined') return;

        // Prevent duplicate overlays
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
        requestAnimationFrame(() => { el.style.opacity = '1'; });

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
                position: absolute; top: 0; left: 0; width: 340px;
                background: rgba(0,0,0,0.85); padding: 20px;
                display: flex; flex-direction: column; align-items: flex-start;
                font-size: 13px; color: #0f0; visibility: hidden;
                border-bottom: 1px solid #0f0; border-right: 1px solid #0f0;
                pointer-events: auto;
            `;
            this.overlay.appendChild(debugEl);
        }

        const sling = stateData.sling || {};
        const raw = sling.rawStick || { x: 0, y: 0 };
        const mag = Math.sqrt(raw.x * raw.x + raw.y * raw.y);

        // Visualize the Deadbolt State
        const isLocked = mag < 0.5 && sling.isCharging;
        const stateTag = isLocked ? '<span style="color:#ff0000">LOCKED</span>' :
            mag >= 0.5 ? '<span style="color:#00ff00">AIMING</span>' : 'IDLE';

        debugEl.innerHTML = `
            <div style="margin-bottom: 10px; border-bottom: 1px solid #444; width: 100%; padding-bottom: 5px;">
                <strong style="color: #0ff;">[ ${playerData.scene || 'SCENE'} ]</strong><br>
                FPS: ${stateData.fps || 0}<br>
                POS: ${playerData.x}, ${playerData.y}<br>
                WORLD: <span style="color: #fff;">${stateData.worldDims || '0x0'}</span><br>
                ENTITIES: <span style="color: #fff;">${stateData.entityCount || 0}</span><br>
                BG: <span style="color: #fff;">${stateData.background || 'None'}</span> (${stateData.bgDims || 'Auto'})<br>
                STATUS: ${stateData.status}
            </div>
            ${stateData.web ? `
            <div style="margin-bottom: 10px; border-bottom: 1px solid #444; width: 100%; padding-bottom: 5px;">
                <strong style="color: #0ff;">[ WEB ]</strong><br>
                LENGTH: <span style="color: #fff;">${stateData.web.length}</span><br>
                MAX: <span style="color: #fff;">${stateData.web.maxLength}</span>
            </div>
            ` : ''}
            <div style="margin-bottom: 10px; border-bottom: 1px solid #444; width: 100%; padding-bottom: 5px; font-size: 11px;">
                <strong style="color: #0ff;">[ CAMERAS ]</strong><br>
                ${(stateData.cameras || []).map(c => `${c}`).join('<br>')}
            </div>
            <div style="margin-bottom: 10px; border-bottom: 1px solid #444; width: 100%; padding-bottom: 5px; font-size: 11px;">
                <strong style="color: #0ff;">[ ENERGY RULES ]</strong><br>
                ${(stateData.energyRules || []).length > 0 
                    ? stateData.energyRules.map(r => `• ${r}`).join('<br>') 
                    : '<span style="color: #888;">None Active</span>'}
            </div>
            <div style="color: #ff8400;">
                <strong style="color: #fff;">[ SLINGSHOT ]</strong><br>
                STATE: ${stateTag}<br>
                RAW MAG: ${mag.toFixed(3)}<br>
                LOCKED VEC: ${(sling.vecX ?? 0).toFixed(2)}, ${(sling.vecY ?? 0).toFixed(2)}<br>
                <br>
                <strong style="color: #fff;">[ DIAGNOSTICS ]</strong><br>
                STICK X: ${raw.x.toFixed(3)}<br>
                STICK Y: ${raw.y.toFixed(3)}
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

export const UI = new UIManager();
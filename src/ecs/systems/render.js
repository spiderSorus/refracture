const { defineQuery, enterQuery, exitQuery, hasComponent } = require('bitecs');
const { Position, Graphic, Input, Debug, Platform, Parent } = require('../components');
const { PPU } = require('../../constants');
const PIXI = require('pixi.js');

const controllers = {
    2: require('../../graphics/platform')
};

const renderQuery = defineQuery([Position, Graphic]);
const renderEnterQuery = enterQuery(renderQuery);
const renderExitQuery = exitQuery(renderQuery);
const playerQuery = defineQuery([Input, Position]);

const sprites = new Map();

module.exports = function createRenderSystem(app, state) {
    // We treat the app.stage as the camera/world container
    const worldLayer = app.stage;
    worldLayer.sortableChildren = true;

    // --- UI OVERLAY SETUP ---
    // We create a container that we will manually lock to screen coordinates
    const uiLayer = new PIXI.Container();
    app.stage.addChild(uiLayer);

    const crosshair = new PIXI.Graphics();
    worldLayer.addChildAt(crosshair, 0);

    const textStyle = new PIXI.TextStyle({
        fontFamily: 'monospace',
        fontSize: 18,
        fill: '#00FF00', // Classic terminal green
        fontWeight: 'bold',
        stroke: { color: '#000000', width: 4 },
    });

    const playerText = new PIXI.Text({ text: '', style: textStyle });
    uiLayer.addChild(playerText);

    function updateHUD(world) {
        if (!state.debug) {
            uiLayer.visible = false;
            return;
        }
        uiLayer.visible = true;

        // --- THE UI STICKY TRICK ---
        // We counteract the camera's movement and scale 
        // to keep the UI fixed in the top-left of the window.
        const invScale = 1 / worldLayer.scale.x;
        uiLayer.scale.set(invScale);
        uiLayer.x = worldLayer.pivot.x - (app.screen.width / 2) * invScale;
        uiLayer.y = worldLayer.pivot.y - (app.screen.height / 2) * invScale;

        // Ensure UI is visually on top of everything
        uiLayer.zIndex = 999;

        const players = playerQuery(world);
        if (players.length > 0) {
            const p = players[0];
            const isAttached = hasComponent(world, Parent, p);
            const status = isAttached ? "[ATTACHED]" : "[FREE]";

            playerText.text = `PLAYER X: ${Position.x[p].toFixed(2)}\nPLAYER Y: ${Position.y[p].toFixed(2)}\nSTATE: ${status}`;
            playerText.position.set(20 * invScale, 20 * invScale);
        }

        // Draw Origin Crosshair (moves with world)
        crosshair.clear();
        const size = 30 * invScale;
        crosshair.moveTo(0, -size).lineTo(0, size).stroke({ width: 2 * invScale, color: 0x00FF00, alpha: 0.5 });
        crosshair.moveTo(-size, 0).lineTo(size, 0).stroke({ width: 2 * invScale, color: 0x00FF00, alpha: 0.5 });
    }

    return (world) => {
        const dt = app.ticker.deltaMS / 1000;

        // 1. Process HUD
        updateHUD(world);

        // 2. ENTITY ENTER
        const entered = renderEnterQuery(world);
        for (let i = 0; i < entered.length; i++) {
            const eid = entered[i];
            const g = new PIXI.Graphics();

            // Platforms in back, players in front
            g.zIndex = hasComponent(world, Platform, eid) ? 0 : 10;

            worldLayer.addChild(g);
            sprites.set(eid, g);
            Graphic.lastFrame[eid] = 65535;
        }

        // 3. ENTITY UPDATE
        const ents = renderQuery(world);
        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            const g = sprites.get(eid);
            if (!g) continue;

            g.visible = hasComponent(world, Debug, eid) ? state.debug : true;
            if (!g.visible) continue;

            // Map world units to pixels
            g.x = Position.x[eid] * PPU;
            g.y = Position.y[eid] * PPU;

            const cId = Graphic.controllerId[eid];
            const ctrl = controllers[cId];

            if (ctrl && typeof ctrl.update === 'function') {
                const currentFrame = Graphic.frame[eid];
                const lastFrame = Graphic.lastFrame[eid];

                if (currentFrame !== lastFrame) {
                    if (ctrl.onFrameChange) ctrl.onFrameChange(eid, lastFrame, currentFrame);
                    Graphic.lastFrame[eid] = currentFrame;
                }
                ctrl.update(g, eid, currentFrame, PPU, dt);
            } else {
                // Default Render Fallback
                g.clear();
                const size = Graphic.size[eid] * PPU;
                const color = Graphic.color[eid] || 0xFFFFFF;
                if (Graphic.shape[eid] === 0) g.circle(0, 0, size / 2).fill(color);
                else g.rect(-size / 2, -size / 2, size, size).fill(color);
            }
        }

        // 4. ENTITY EXIT
        const exited = renderExitQuery(world);
        for (let i = 0; i < exited.length; i++) {
            const eid = exited[i];
            const g = sprites.get(eid);
            if (g) {
                worldLayer.removeChild(g);
                g.destroy();
                sprites.delete(eid);
            }
        }

        // Final sort to handle Z-indices
        worldLayer.sortChildren();
    };
};
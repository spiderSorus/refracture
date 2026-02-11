const { defineQuery, enterQuery, exitQuery, hasComponent } = require('bitecs');
const { Position, Graphic, Debug } = require('../components');
const { PPU, UNIT_SIZE } = require('../../constants');
const PIXI = require('pixi.js');

const renderQuery = defineQuery([Position, Graphic]);
const renderEnterQuery = enterQuery(renderQuery);
const renderExitQuery = exitQuery(renderQuery);
const sprites = new Map();

module.exports = function createRenderSystem(app, state) {
    // 1. World Layer (moves with camera)
    const worldLayer = app.stage;

    // 2. UI Layer (static screen space)
    const uiLayer = new PIXI.Container();
    app.stage.parent.addChild(uiLayer);

    const crosshair = new PIXI.Graphics();
    uiLayer.addChild(crosshair);

    function drawOriginCrosshair() {
        crosshair.clear();
        if (!state.debug) return;

        // Convert World Origin (0,0) to Screen Pixels
        // Formula: (WorldPos - Pivot) * Scale + ScreenCenter
        const zoom = worldLayer.scale.x;
        const screenX = (0 - worldLayer.pivot.x) * zoom + (app.screen.width / 2);
        const screenY = (0 - worldLayer.pivot.y) * zoom + (app.screen.height / 2);

        const size = 25; // Length of the arms
        const thickness = 4;

        crosshair.setStrokeStyle({ width: thickness, color: 0x00FF00 });

        // Draw the cross centered at the screen-mapped origin
        crosshair.moveTo(screenX, screenY - size).lineTo(screenX, screenY + size);
        crosshair.moveTo(screenX - size, screenY).lineTo(screenX + size, screenY);
        crosshair.stroke();
    }

    return (world) => {
        drawOriginCrosshair();

        // --- Standard ECS Rendering ---
        const entered = renderEnterQuery(world);
        for (let i = 0; i < entered.length; i++) {
            const eid = entered[i];
            const g = new PIXI.Graphics();
            const sizePx = Graphic.size[eid] * PPU;

            if (Graphic.shape[eid] === 0) {
                g.circle(0, 0, sizePx / 2).fill(Graphic.color[eid]);
            } else {
                g.rect(-sizePx / 2, -sizePx / 2, sizePx, sizePx).fill(Graphic.color[eid]);
            }

            worldLayer.addChild(g);
            sprites.set(eid, g);
        }

        const ents = renderQuery(world);
        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            const visual = sprites.get(eid);

            if (visual) {
                const isDebugEntity = hasComponent(world, Debug, eid);
                visual.visible = isDebugEntity ? state.debug : true;
                visual.x = Position.x[eid] * PPU;
                visual.y = Position.y[eid] * PPU;
            }
        }

        const exited = renderExitQuery(world);
        for (let i = 0; i < exited.length; i++) {
            const eid = exited[i];
            const visual = sprites.get(eid);
            if (visual) {
                worldLayer.removeChild(visual);
                visual.destroy();
                sprites.delete(eid);
            }
        }
    };
};
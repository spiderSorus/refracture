const { defineQuery, enterQuery, exitQuery, hasComponent } = require('bitecs');
const { Position, Graphic, Input, Debug, Platform, Parent, WorldSpace } = require('../components');
const { PPU } = require('../../constants');
const PIXI = require('pixi.js');

const controllers = {
    2: require('../../graphics/platform'),
    3: require('../../graphics/web')
};

const renderQuery = defineQuery([WorldSpace, Graphic]);
const renderEnterQuery = enterQuery(renderQuery);
const renderExitQuery = exitQuery(renderQuery);
const playerQuery = defineQuery([Input, WorldSpace]);

module.exports = function createRenderSystem(app, state) {
    const worldLayer = app.stage;
    worldLayer.sortableChildren = true;

    // MOVED INSIDE: Fresh map for every scene
    const sprites = new Map();

    const uiLayer = new PIXI.Container();
    app.stage.addChild(uiLayer);
    uiLayer.zIndex = 1000;

    const crosshair = new PIXI.Graphics();
    uiLayer.addChild(crosshair);

    const textStyle = new PIXI.TextStyle({
        fontFamily: 'monospace', fontSize: 18, fill: '#00FF00', fontWeight: 'bold',
        stroke: { color: '#000000', width: 4 },
    });

    const playerText = new PIXI.Text({ text: '', style: textStyle });
    uiLayer.addChild(playerText);

    function updateHUD(world) {
        const invScale = 1 / worldLayer.scale.x;
        uiLayer.scale.set(invScale);
        uiLayer.x = worldLayer.pivot.x - (app.screen.width / 2) * invScale;
        uiLayer.y = worldLayer.pivot.y - (app.screen.height / 2) * invScale;

        const players = playerQuery(world);
        if (players.length > 0) {
            const p = players[0];
            const isAttached = hasComponent(world, Parent, p);
            playerText.text = `WORLD X: ${WorldSpace.x[p].toFixed(2)}\nWORLD Y: ${WorldSpace.y[p].toFixed(2)}\nSTATE: ${isAttached ? "[ATTACHED]" : "[FREE]"}`;
            playerText.position.set(20 * invScale, 20 * invScale);
        }

        crosshair.clear();
        const originX = -uiLayer.x;
        const originY = -uiLayer.y;
        const size = 20 * invScale;
        crosshair.moveTo(originX, originY - size).lineTo(originX, originY + size).stroke({ width: 2 * invScale, color: 0x00FF00, alpha: 0.5 });
        crosshair.moveTo(originX - size, originY).lineTo(originX + size, originY).stroke({ width: 2 * invScale, color: 0x00FF00, alpha: 0.5 });
    }

    return (world) => {
        const dt = app.ticker.deltaMS / 1000;
        uiLayer.visible = state.debug;
        if (state.debug) updateHUD(world);

        const entered = renderEnterQuery(world);
        for (let i = 0; i < entered.length; i++) {
            const eid = entered[i];
            const g = new PIXI.Graphics();
            const cId = Graphic.controllerId[eid];
            g.zIndex = (cId === 2 || cId === 3) ? 0 : 10;
            worldLayer.addChild(g);
            sprites.set(eid, g);
            Graphic.lastFrame[eid] = 65535;
        }

        const ents = renderQuery(world);
        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            const g = sprites.get(eid);
            if (!g) continue;

            g.visible = hasComponent(world, Debug, eid) ? state.debug : true;
            if (!g.visible) continue;

            g.x = WorldSpace.x[eid] * PPU;
            g.y = WorldSpace.y[eid] * PPU;

            const cId = Graphic.controllerId[eid];
            const ctrl = controllers[cId];

            if (ctrl && typeof ctrl.update === 'function') {
                ctrl.update(g, eid, Graphic.frame[eid], PPU, dt, world);
            } else {
                g.clear();
                const size = Graphic.size[eid] * PPU;
                if (Graphic.shape[eid] === 0) g.circle(0, 0, size / 2).fill(Graphic.color[eid]);
                else g.rect(-size / 2, -size / 2, size, size).fill(Graphic.color[eid]);
            }
        }

        const exited = renderExitQuery(world);
        for (let i = 0; i < exited.length; i++) {
            const eid = exited[i];
            const g = sprites.get(eid);
            if (g) { worldLayer.removeChild(g); g.destroy(); sprites.delete(eid); }
        }
        worldLayer.sortChildren();
    };
};
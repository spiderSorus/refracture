const { defineQuery, enterQuery, exitQuery, hasComponent } = require('bitecs');
const { Position, Graphic, Debug } = require('../components');
const { PPU, UNIT_SIZE } = require('../../constants');
const PIXI = require('pixi.js');

const renderQuery = defineQuery([Position, Graphic]);
const renderEnterQuery = enterQuery(renderQuery);
const renderExitQuery = exitQuery(renderQuery);
const sprites = new Map();

module.exports = function createRenderSystem(app, state) {
    const grid = new PIXI.Graphics();
    app.stage.addChild(grid);

    function drawWorldGrid() {
        grid.clear();
        if (!state.debug) return;

        const color = 0x333333;
        const step = UNIT_SIZE * PPU; // 80px

        // We draw a large enough area to cover the movement
        // Or you can draw based on the current view bounds
        const gridRange = 5000;

        for (let x = -gridRange; x <= gridRange; x += step) {
            grid.rect(x, -gridRange, 1, gridRange * 2).fill(color);
        }
        for (let y = -gridRange; y <= gridRange; y += step) {
            grid.rect(-gridRange, y, gridRange * 2, 1).fill(color);
        }
    }

    return (world) => {
        drawWorldGrid();

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

            app.stage.addChild(g);
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
                app.stage.removeChild(visual);
                visual.destroy();
                sprites.delete(eid);
            }
        }
    };
};
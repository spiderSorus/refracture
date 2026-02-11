const { defineQuery, enterQuery, exitQuery } = require('bitecs');
const { Position, Graphic } = require('../components');
const PIXI = require('pixi.js');

const renderQuery = defineQuery([Position, Graphic]);
const renderEnterQuery = enterQuery(renderQuery);
const renderExitQuery = exitQuery(renderQuery);

const sprites = new Map();

module.exports = function createRenderSystem(app) {
    return (world) => {
        const entered = renderEnterQuery(world);
        for (let i = 0; i < entered.length; i++) {
            const eid = entered[i];
            const g = new PIXI.Graphics();

            const color = Graphic.color[eid];
            const size = Graphic.size[eid];

            // Pixi v8 API: circle() and fill()
            if (Graphic.shape[eid] === 0) {
                g.circle(0, 0, size).fill(color);
            } else {
                g.rect(-size / 2, -size / 2, size, size).fill(color);
            }

            app.stage.addChild(g);
            sprites.set(eid, g);
        }

        const entities = renderQuery(world);
        for (let i = 0; i < entities.length; i++) {
            const eid = entities[i];
            const visual = sprites.get(eid);
            if (visual) {
                visual.x = Position.x[eid];
                visual.y = Position.y[eid];
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
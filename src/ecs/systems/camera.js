const { defineQuery } = require('bitecs');
const { Position, CameraTarget } = require('../components');
const { PPU } = require('../../constants');

const targetQuery = defineQuery([Position, CameraTarget]);

module.exports = function createCameraSystem(app) {
    return (world) => {
        const ents = targetQuery(world);
        if (ents.length === 0) return;

        let targetX, targetY;
        let zoom = 1.0;

        if (ents.length === 1) {
            targetX = Position.x[ents[0]] * PPU;
            targetY = Position.y[ents[0]] * PPU;
        } else {
            const e1 = ents[0];
            const e2 = ents[1];
            const p1x = Position.x[e1] * PPU;
            const p1y = Position.y[e1] * PPU;
            const p2x = Position.x[e2] * PPU;
            const p2y = Position.y[e2] * PPU;

            targetX = (p1x + p2x) / 2;
            targetY = (p1y + p2y) / 2;

            const dx = Math.abs(p1x - p2x);
            const dy = Math.abs(p1y - p2y);
            const padding = 200; 
            
            const zoomX = app.screen.width / (dx + padding);
            const zoomY = app.screen.height / (dy + padding);
            zoom = Math.min(zoomX, zoomY, 1.0);
        }

        const lerp = 0.1;
        
        // Smooth zoom
        app.stage.scale.set(
            app.stage.scale.x + (zoom - app.stage.scale.x) * lerp
        );
        
        // Smooth pivot (looking at target)
        app.stage.pivot.x += (targetX - app.stage.pivot.x) * lerp;
        app.stage.pivot.y += (targetY - app.stage.pivot.y) * lerp;
        
        // Offset stage to center the pivot on screen
        app.stage.position.x = app.screen.width / 2;
        app.stage.position.y = app.screen.height / 2;
    };
};

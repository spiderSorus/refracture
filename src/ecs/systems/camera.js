const { defineQuery } = require('bitecs');
const { WorldSpace, CameraTarget } = require('../components');
const { PPU } = require('../../constants');

// Query for entities that have a WorldSpace and are targets
const targetQuery = defineQuery([WorldSpace, CameraTarget]);

module.exports = function createCameraSystem(app) {
    return (world) => {
        const ents = targetQuery(world);
        if (ents.length === 0) return;

        let targetX, targetY;
        let zoom = 1.0;

        if (ents.length === 1) {
            // Single target: Lock on directly
            targetX = WorldSpace.x[ents[0]] * PPU;
            targetY = WorldSpace.y[ents[0]] * PPU;
        } else {
            // Multiple targets: Find midpoint
            // In your case: Midpoint between Sun (0,0) and Player (Orbiting)
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            for(let i=0; i < ents.length; i++) {
                const eid = ents[i];
                const wx = WorldSpace.x[eid] * PPU;
                const wy = WorldSpace.y[eid] * PPU;
                
                if (wx < minX) minX = wx;
                if (wx > maxX) maxX = wx;
                if (wy < minY) minY = wy;
                if (wy > maxY) maxY = wy;
            }

            targetX = (minX + maxX) / 2;
            targetY = (minY + maxY) / 2;

            // Auto-Zoom Calculation
            const dx = Math.abs(maxX - minX);
            const dy = Math.abs(maxY - minY);
            const padding = 300; // Extra breathing room
            
            // Calculate zoom needed to fit the bounding box
            const zoomX = app.screen.width / (dx + padding);
            const zoomY = app.screen.height / (dy + padding);
            
            // Clamp zoom (don't zoom in too close if targets are overlapping)
            zoom = Math.min(zoomX, zoomY, 1.5);
            // Don't zoom out too far
            zoom = Math.max(zoom, 0.5);
        }

        const lerp = 0.05; // Slower lerp for smoother camera
        
        // Smooth Zoom
        app.stage.scale.set(
            app.stage.scale.x + (zoom - app.stage.scale.x) * lerp
        );
        
        // Smooth Pan
        app.stage.pivot.x += (targetX - app.stage.pivot.x) * lerp;
        app.stage.pivot.y += (targetY - app.stage.pivot.y) * lerp;
        
        // Keep pivot centered on screen
        app.stage.position.x = app.screen.width / 2;
        app.stage.position.y = app.screen.height / 2;
    };
};

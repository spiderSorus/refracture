import { RenderFactory } from './RenderFactory';

/**
 * RenderSystem
 * Handles standard rendering of entities using Renderable definitions.
 * Assigns objects to Phaser layers based on ZLayer or BackgroundTag.
 * Uses alpha for interpolation between physics steps.
 */
export const RenderSystem = (entities, scene, alpha = 1.0) => {
    // 1. Initialize Scene Layers if not present
    if (!scene.bgLayer || !scene.bgLayer.list) scene.bgLayer = scene.add.layer().setName('BG_LAYER').setDepth(50);
    if (!scene.fgLayer || !scene.fgLayer.list) scene.fgLayer = scene.add.layer().setName('FG_LAYER').setDepth(100);
    if (!scene.foreLayer || !scene.foreLayer.list) scene.foreLayer = scene.add.layer().setName('FORE_LAYER').setDepth(200);

    entities.forEach(entity => {
        const { Position: pos, Rotation: rot, Renderable: renderable, ZLayer: zlayer } = entity.components;
        if (!renderable) return;

        const definitions = renderable.definitions;
        const activeGraphics = renderable.activeVisuals; 

        // 2. Render all defined layers
        Object.keys(definitions).forEach(layerKey => {
            const config = definitions[layerKey];

            if (!activeGraphics[layerKey]) {
                // Create Graphic Instance
                activeGraphics[layerKey] = RenderFactory.createGraphic(scene, { ...config, layer: layerKey });
                const gfx = activeGraphics[layerKey];

                // Determine which Phaser Layer to use
                let targetLayer = scene.fgLayer;
                
                // 1. Check for explicit auxiliary layer override
                if (zlayer && zlayer.layerName && scene.auxLayers && scene.auxLayers[zlayer.layerName]) {
                    targetLayer = scene.auxLayers[zlayer.layerName];
                } 
                // 2. Fallback to standard ZType logic
                else {
                    const zType = zlayer ? zlayer.type : (entity.components.BackgroundTag ? 'BACK' : 'PLAY');
                    if (zType === 'BACK') targetLayer = scene.bgLayer;
                    if (zType === 'FORE') targetLayer = scene.foreLayer;
                }
                
                // Add to the appropriate Phaser Layer
                [gfx.gameObject, gfx.emitter, gfx.tracerGfx].forEach(item => {
                    if (!item || (item.scene && item.scene !== scene)) return;

                    // If we have a target layer with a valid list, add it there
                    // Check for type === 'Layer' to be absolutely sure
                    if (targetLayer && (targetLayer.type === 'Layer' || targetLayer.list) && typeof targetLayer.add === 'function') {
                        try {
                            targetLayer.add(item);
                        } catch (e) {
                            scene.add.existing(item);
                        }
                    } else {
                        // Fallback to scene's display list
                        scene.add.existing(item);
                    }
                });

                // Default scroll factor (ParallaxSystem will override if needed)
                if (gfx.gameObject && gfx.gameObject.setScrollFactor) {
                    gfx.gameObject.setScrollFactor(1);
                }
            }

            const activeGfx = activeGraphics[layerKey];

            // Update with interpolated position
            if (pos) {
                const renderX = pos.prevX !== undefined ? pos.prevX + (pos.x - pos.prevX) * alpha : pos.x;
                const renderY = pos.prevY !== undefined ? pos.prevY + (pos.y - pos.prevY) * alpha : pos.y;
                activeGfx.update({ x: renderX, y: renderY }, rot, config);
            }
            activeGfx.setVisible(true);

            // Sync depth within the Phaser Layer
            if (config.depth !== undefined) {
                if (activeGfx.gameObject && activeGfx.gameObject.setDepth) activeGfx.gameObject.setDepth(config.depth);
                if (activeGfx.emitter && activeGfx.emitter.setDepth) activeGfx.emitter.setDepth(config.depth);
                if (activeGfx.tracerGfx && activeGfx.tracerGfx.setDepth) activeGfx.tracerGfx.setDepth(config.depth);
            }
        });

        // 3. Cleanup
        Object.keys(activeGraphics).forEach(activeKey => {
            if (!definitions[activeKey]) {
                activeGraphics[activeKey].destroy();
                delete activeGraphics[activeKey];
            }
        });
    });
};

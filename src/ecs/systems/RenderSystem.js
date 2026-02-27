import { RenderFactory } from './RenderFactory';

/**
 * RenderSystem
 * Handles standard rendering of entities using Renderable definitions.
 * Assigns objects to Phaser layers based on ZLayer or BackgroundTag.
 * Uses alpha for interpolation between physics steps.
 */
export const RenderSystem = (entities, scene, alpha = 1.0) => {
    // 1. Initialize Scene Layers if not present
    if (!scene.backgroundLayer) scene.backgroundLayer = scene.add.layer().setName('BACKGROUND_LAYER').setDepth(50);
    if (!scene.playLayer) scene.playLayer = scene.add.layer().setName('PLAY_LAYER').setDepth(100);
    if (!scene.foregroundLayer) scene.foregroundLayer = scene.add.layer().setName('FOREGROUND_LAYER').setDepth(200);
    if (!scene.uiLayer) scene.uiLayer = scene.add.layer().setName('UI_LAYER').setDepth(2000);

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
                let targetLayer = scene.playLayer;
                
                // 1. Check for explicit auxiliary layer override
                if (zlayer && zlayer.layerName && scene.auxLayers && scene.auxLayers[zlayer.layerName]) {
                    targetLayer = scene.auxLayers[zlayer.layerName];
                } 
                // 2. Fallback to standard ZType logic
                else {
                    const zType = zlayer ? zlayer.type : (entity.components.BackgroundTag ? 'BACKGROUND' : 'PLAY');
                    
                    // Attempt to find a default auxiliary layer of that type
                    const defaultAux = scene.cameraConfigs ? scene.cameraConfigs.find(cfg => cfg.type === zType) : null;
                    
                    if (defaultAux && scene.auxLayers && scene.auxLayers[defaultAux.layer]) {
                        targetLayer = scene.auxLayers[defaultAux.layer];
                    } else {
                        // Legacy fallback
                        if (zType === 'BACKGROUND') targetLayer = scene.backgroundLayer;
                        else targetLayer = scene.playLayer;
                    }
                }
                
                // Add to the appropriate Phaser Layer
                [gfx.gameObject, gfx.emitter, gfx.tracerGfx].forEach(item => {
                    if (!item) return;

                    // Ensure targetLayer is valid and has an 'add' function.
                    // If it's destroyed or invalid, targetLayer.scene will be null.
                    if (targetLayer && targetLayer.scene && typeof targetLayer.add === 'function') {
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

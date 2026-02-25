import { RenderFactory } from './RenderFactory';

/**
 * Simplified LayeredRenderSystem
 * Manages life and position of graphics based on Renderable definitions.
 * Categorizes objects into bgLayer and fgLayer for post-processing isolation.
 */
export const LayeredRenderSystem = (entities, scene) => {
    entities.forEach(entity => {
        const { Position: pos, Rotation: rot, Renderable: renderable } = entity.components;
        if (!renderable) return;

        const definitions = renderable.definitions;
        const activeGraphics = renderable.activeVisuals; 

        // 1. Render all defined layers
        Object.keys(definitions).forEach(layerKey => {
            const config = definitions[layerKey];

            if (!activeGraphics[layerKey]) {
                // Create Graphic Instance
                activeGraphics[layerKey] = RenderFactory.createGraphic(scene, { ...config, layer: layerKey });

                // Categorize into Scene Layers for Post-Processing
                const zLayer = entity.components.ZLayer;
                if (zLayer && zLayer.type === 'BACK' && scene.bgLayer) {
                    scene.bgLayer.add(activeGraphics[layerKey].gameObject);
                } else if (scene.fgLayer) {
                    scene.fgLayer.add(activeGraphics[layerKey].gameObject);
                }
            }

            const activeGfx = activeGraphics[layerKey];
            activeGfx.update(pos, rot, config);
            activeGfx.setVisible(true);

            // Sync depth from definition (set by ZLayerSystem)
            if (activeGfx.gameObject && config.depth !== undefined) {
                activeGfx.gameObject.setDepth(config.depth);
                if (activeGfx.emitter) activeGfx.emitter.setDepth(config.depth);
            }
        });

        // 2. Cleanup
        Object.keys(activeGraphics).forEach(activeKey => {
            if (!definitions[activeKey]) {
                activeGraphics[activeKey].destroy();
                delete activeGraphics[activeKey];
            }
        });
    });
};

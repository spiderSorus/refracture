import { RenderFactory } from './RenderFactory';

export const LayeredRenderSystem = (entities, scene) => {
    // 1. Find Player's View Layers
    const player = entities.find(e => e.components.PlayerTag);
    const viewLayers = player && player.components.ViewLayers
        ? player.components.ViewLayers.layers
        : ['BASE'];

    entities.forEach(entity => {
        const { Position: pos, Rotation: rot, Renderable: renderable } = entity.components;

        if (!renderable) return;

        const definitions = renderable.definitions;
        const activeGraphics = renderable.activeVisuals; // Holds instances of BaseGraphic

        // 2. Iterate over all defined layers for this entity
        Object.keys(definitions).forEach(layerKey => {
            const config = definitions[layerKey];

            // Logic: Is this layer visible to the player?
            const isVisible = viewLayers.some(view => layerKey === view || layerKey.startsWith(view + '_'));

            if (isVisible) {
                // CASE A: Should be visible
                if (!activeGraphics[layerKey]) {
                    // Create Graphic Instance
                    activeGraphics[layerKey] = RenderFactory.createGraphic(scene, { ...config, layer: layerKey });
                }

                // Delegate Update to the Graphic Instance
                activeGraphics[layerKey].update(pos, rot, config);
                activeGraphics[layerKey].setVisible(true);

            } else {
                // CASE B: Should NOT be visible
                if (activeGraphics[layerKey]) {
                    activeGraphics[layerKey].setVisible(false);
                }
            }
        });

        // 3. Cleanup "Stale" Graphics
        Object.keys(activeGraphics).forEach(activeKey => {
            if (!definitions[activeKey]) {
                activeGraphics[activeKey].destroy(); // The Graphic class cleans up its Phaser object
                delete activeGraphics[activeKey];
            }
        });
    });
};
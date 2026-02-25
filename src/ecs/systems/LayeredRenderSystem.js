import { RenderFactory } from './RenderFactory';

/**
 * LayeredRenderSystem
 * Manages life and position of graphics based on Renderable definitions.
 * Uses Phaser Layers to organize rendering and handle parallax efficiently.
 */
export const LayeredRenderSystem = (entities, scene) => {
    // 1. Initialize Layer Management
    if (!scene.renderLayers) {
        scene.renderLayers = new Map();
        
        // If scene already has bgLayer/fgLayer, register them in our map
        if (scene.bgLayer) {
            scene.renderLayers.set('BACK_0_1.00', scene.bgLayer);
        }
        if (scene.fgLayer) {
            scene.renderLayers.set('PLAY_0_1.00', scene.fgLayer);
        }
    }

    entities.forEach(entity => {
        const { Position: pos, Rotation: rot, Renderable: renderable, ZLayer: zlayer, Parallax: parallax } = entity.components;
        if (!renderable) return;

        const definitions = renderable.definitions;
        const activeGraphics = renderable.activeVisuals; 

        // 2. Render all defined layers
        Object.keys(definitions).forEach(layerKey => {
            const config = definitions[layerKey];

            if (!activeGraphics[layerKey]) {
                // Create Graphic Instance
                activeGraphics[layerKey] = RenderFactory.createGraphic(scene, { ...config, layer: layerKey });

                // Determine which Phaser Layer to use
                const zType = zlayer ? zlayer.type : (entity.components.BackgroundTag ? 'BACK' : 'PLAY');
                const zIndex = zlayer ? zlayer.index : 0;
                const factor = parallax ? parallax.factor : 1.0;

                const targetLayer = getOrCreateLayer(scene, zType, zIndex, factor);
                
                const gfx = activeGraphics[layerKey];
                if (gfx.gameObject) targetLayer.add(gfx.gameObject);
                if (gfx.emitter) targetLayer.add(gfx.emitter);
                if (gfx.tracerGfx) targetLayer.add(gfx.tracerGfx);

                // IMPORTANT: The GameObject itself should NOT have a scrollFactor set
                // if we are using Layer-level scrollFactor, unless we want multiplication.
                // We set it to 1 to ensure it follows the layer exactly.
                if (gfx.gameObject && gfx.gameObject.setScrollFactor) {
                    gfx.gameObject.setScrollFactor(1);
                }
            }

            const activeGfx = activeGraphics[layerKey];
            activeGfx.update(pos, rot, config);
            activeGfx.setVisible(true);

            // Sync depth within the layer
            if (config.depth !== undefined) {
                if (activeGfx.gameObject) activeGfx.gameObject.setDepth(config.depth);
                if (activeGfx.emitter) activeGfx.emitter.setDepth(config.depth);
                if (activeGfx.tracerGfx) activeGfx.tracerGfx.setDepth(config.depth);
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

/**
 * Helper to get or create a Phaser Layer with specific properties.
 */
function getOrCreateLayer(scene, type, index, factor) {
    // Standardize key: factor should be fixed-precision to avoid key mismatch
    const factorKey = Number(factor).toFixed(2);
    const key = `${type}_${index}_${factorKey}`;
    
    if (scene.renderLayers.has(key)) {
        return scene.renderLayers.get(key);
    }

    const layer = scene.add.layer();
    layer.setName(`LAYER_${key}`);
    
    // Calculate global depth for the layer
    // Background: 0-99, Play: 100-199, Fore: 200+
    let baseDepth = 100;
    if (type === 'BACK') baseDepth = 50;
    if (type === 'FORE') baseDepth = 200;
    
    layer.setDepth(baseDepth - index);
    layer.setScrollFactor(factor);

    // Backward compatibility for other systems
    if (type === 'BACK' && index === 0 && factor === 1.0) scene.bgLayer = layer;
    if (type === 'PLAY' && index === 0 && factor === 1.0) scene.fgLayer = layer;

    scene.renderLayers.set(key, layer);
    return layer;
}

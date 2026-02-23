import { RenderFactory } from './RenderFactory';

export const LayeredRenderSystem = (entities, scene) => {
    // 1. Find Player's View Layers
    const player = entities.find(e => e.components.PlayerTag);
    const viewLayers = player && player.components.ViewLayers
        ? player.components.ViewLayers.layers
        : ['BASE'];
    
    const currentRealityLevel = player?.components.MeditationState?.currentLevel || 0;

    entities.forEach(entity => {
        const { Position: pos, Rotation: rot, Renderable: renderable, RealityLevel: reality } = entity.components;

        if (!renderable) return;

        // --- REALITY LEVEL FILTER ---
        // 1. If entity has RealityLevel, check if currentLevel is in 'visible' array
        // 2. If no RealityLevel, assume it belongs to Level 0
        // 3. Player is always visible to themselves
        const canSee = reality ? reality.visible.includes(currentRealityLevel) : (currentRealityLevel === 0);
        const isPlayer = !!entity.components.PlayerTag;
        
        // GHOST LOGIC: Is this entity the parent of the player?
        const isParentOfPlayer = player?.components.Parent?.id === entity.id;
        const isGhost = isParentOfPlayer && !canSee;

        const definitions = renderable.definitions;
        const activeGraphics = renderable.activeVisuals; 

        // 2. Iterate over all defined layers for this entity
        Object.keys(definitions).forEach(layerKey => {
            const config = definitions[layerKey];

            // Logic: Is this layer visible to the player?
            const isVisible = (canSee || isPlayer || isGhost) && viewLayers.some(view => layerKey === view || layerKey.startsWith(view + '_'));

            if (isVisible) {
                // CASE A: Should be visible
                if (!activeGraphics[layerKey]) {
                    // Create Graphic Instance
                    activeGraphics[layerKey] = RenderFactory.createGraphic(scene, { ...config, layer: layerKey });
                }

                // Delegate Update to the Graphic Instance
                const activeGfx = activeGraphics[layerKey];
                activeGfx.update(pos, rot, config);
                activeGfx.setVisible(true);

                // --- PLAYER DEPTH OVERRIDE ---
                if (isPlayer && activeGfx.gameObject) {
                    activeGfx.gameObject.setDepth(5000 + (config.depth || 0));
                }

                // --- GHOST OVERRIDE ---
                if (isGhost && activeGfx.gameObject) {
                    activeGfx.gameObject.setAlpha(0.3);
                } else if (activeGfx.gameObject && !isPlayer) {
                    // Reset alpha for non-ghosts (unless it's the player)
                    activeGfx.gameObject.setAlpha(config.alpha ?? 1.0);
                }

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
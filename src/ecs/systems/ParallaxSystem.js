/**
 * ParallaxSystem
 * Updates the visual position of renderable entities based on camera movement.
 * Does NOT affect the physical Position component, only the rendered GameObject.
 * Uses alpha for interpolation between physics steps.
 */
export const ParallaxSystem = (entities, scene, alpha = 1.0) => {
    const cam = scene.cameras.main;

    // Atmospheric Depth settings
    const enableAtmosphere = scene.enableAtmosphere ?? false;
    const atmosphereColor = scene.cameras.main.backgroundColor.color;
    const atmosphereIntensity = scene.atmosphereIntensity ?? 0.8;

    entities.forEach(entity => {
        const { Position: pos, Renderable: renderable, Parallax: parallax } = entity.components;
        if (!renderable || !parallax || !pos) return;

        const factor = parallax.factor;
        
        // --- 1. POSITION UPDATE ---
        let renderX = pos.x;
        let renderY = pos.y;

        if (factor !== 1.0) {
            const worldX = pos.prevX !== undefined ? pos.prevX + (pos.x - pos.prevX) * alpha : pos.x;
            const worldY = pos.prevY !== undefined ? pos.prevY + (pos.y - pos.prevY) * alpha : pos.y;
            
            // Standard Top-Left Anchored Parallax
            // Visually matches Phaser's scrollFactor behavior.
            renderX = worldX + cam.scrollX * (1.0 - factor);
            renderY = worldY + cam.scrollY * (1.0 - factor);
        }

        Object.values(renderable.activeVisuals).forEach(gfx => {
            if (gfx.gameObject) {
                gfx.gameObject.x = renderX;
                gfx.gameObject.y = renderY;

                // --- 2. ATMOSPHERIC DEPTH (TINTING) ---
                if (enableAtmosphere) {
                    const depthEffect = (1.0 - factor) * atmosphereIntensity;
                    if (gfx.setAtmosphere) {
                        gfx.setAtmosphere(atmosphereColor, depthEffect);
                    }
                } else if (gfx.setAtmosphere) {
                    gfx.setAtmosphere(null, 0);
                }
            }
            if (gfx.emitter) {
                gfx.emitter.setPosition(renderX, renderY);
            }
        });
    });
};

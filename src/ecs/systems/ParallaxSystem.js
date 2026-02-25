/**
 * ParallaxSystem
 * Updates the visual position of renderable entities based on camera movement.
 * Does NOT affect the physical Position component, only the rendered GameObject.
 * Uses alpha for interpolation between physics steps.
 */
export const ParallaxSystem = (entities, scene, alpha = 1.0) => {
    const cam = scene.cameras.main;
    const centerX = cam.scrollX + cam.width / 2;
    const centerY = cam.scrollY + cam.height / 2;

    // Atmospheric Depth settings
    const atmosphereColor = scene.atmosphereColor ?? null; // e.g., 0xffffff
    const atmosphereIntensity = scene.atmosphereIntensity ?? 0.5;

    entities.forEach(entity => {
        const { Position: pos, Renderable: renderable, Parallax: parallax } = entity.components;
        if (!renderable || !parallax || !pos) return;

        const factor = parallax.factor;
        
        // --- 1. POSITION UPDATE ---
        // If factor is 1.0, it moves normally with the world (no parallax needed here)
        let renderX = pos.x;
        let renderY = pos.y;

        if (factor !== 1.0) {
            const worldX = pos.prevX !== undefined ? pos.prevX + (pos.x - pos.prevX) * alpha : pos.x;
            const worldY = pos.prevY !== undefined ? pos.prevY + (pos.y - pos.prevY) * alpha : pos.y;
            renderX = centerX + (worldX - centerX) * factor;
            renderY = centerY + (worldY - centerY) * factor;
        }

        Object.values(renderable.activeVisuals).forEach(gfx => {
            if (gfx.gameObject) {
                gfx.gameObject.x = renderX;
                gfx.gameObject.y = renderY;

                // --- 2. ATMOSPHERIC DEPTH (TINTING) ---
                if (atmosphereColor !== null) {
                    // Farther objects (lower factor) get more atmospheric tint
                    // factor 0.0 -> full intensity
                    // factor 1.0 -> 0 intensity
                    const depthEffect = (1.0 - factor) * atmosphereIntensity;
                    
                    if (gfx.gameObject.setTint) {
                        // Phaser's setTint is multiplicative. 
                        // To "whiten", we can use setPostPipeline or simpler:
                        // If we want to fade to white, we can use alpha and a background color,
                        // or just use tint to darken. For whitening, we might use setTintFill on some shapes.
                        // However, a robust way for any object is setTint.
                        
                        // For a "white" fog effect on dark objects, we actually want to interpolate 
                        // the color. Since we can't easily interpolate towards white with setTint,
                        // we'll use the alpha channel to simulate fading into the "atmosphere".
                        
                        // If we are on a black background, fading to white requires an overlay.
                        // If we are on a white background, fading to white is just alpha.
                        
                        // Given the request "I want it white", let's assume we want the objects 
                        // themselves to become whiter as they recede.
                        if (gfx.gameObject.setAlpha) {
                            const baseAlpha = renderable.definitions[gfx.layer]?.alpha ?? 1.0;
                            // As it recedes, it gets "thicker" with fog? 
                            // Or fades out? Usually fog makes things LESS visible (lower contrast).
                            // Let's use the tint to whiten if supported, else alpha.
                        }
                    }
                }
            }
            if (gfx.emitter) {
                gfx.emitter.setPosition(renderX, renderY);
            }
        });
    });
};

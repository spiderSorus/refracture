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

    entities.forEach(entity => {
        const { Position: pos, Renderable: renderable, Parallax: parallax } = entity.components;
        if (!renderable || !parallax || !pos) return;

        const factor = parallax.factor;
        // If factor is 1.0, it moves normally with the world (no parallax needed here)
        if (factor === 1.0) return;

        // Use interpolated position
        const worldX = pos.prevX !== undefined ? pos.prevX + (pos.x - pos.prevX) * alpha : pos.x;
        const worldY = pos.prevY !== undefined ? pos.prevY + (pos.y - pos.prevY) * alpha : pos.y;

        // Calculate parallax position relative to camera center
        const renderX = centerX + (worldX - centerX) * factor;
        const renderY = centerY + (worldY - centerY) * factor;

        Object.values(renderable.activeVisuals).forEach(gfx => {
            if (gfx.gameObject) {
                gfx.gameObject.x = renderX;
                gfx.gameObject.y = renderY;
            }
            if (gfx.emitter) {
                gfx.emitter.setPosition(renderX, renderY);
            }
        });
    });
};

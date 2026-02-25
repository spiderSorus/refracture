/**
 * ParallaxSystem
 * Updates the visual position of renderable entities based on camera movement.
 * Does NOT affect the physical Position component, only the rendered GameObject.
 */
export const ParallaxSystem = (entities, scene) => {
    const cam = scene.cameras.main;
    const centerX = cam.scrollX + cam.width / 2;
    const centerY = cam.scrollY + cam.height / 2;

    entities.forEach(entity => {
        const { Position: pos, Renderable: renderable, Parallax: parallax } = entity.components;
        if (!renderable || !parallax || !pos) return;

        const factor = parallax.factor;
        // If factor is 1.0, it moves normally with the world (no parallax needed here)
        if (factor === 1.0) return;

        // Calculate parallax position relative to camera center
        // Objects further away (factor < 1) move slower
        // Objects closer (factor > 1) move faster
        const renderX = centerX + (pos.x - centerX) * factor;
        const renderY = centerY + (pos.y - centerY) * factor;

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

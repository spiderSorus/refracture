export const TargetRenderSystem = (entities, scene) => {
    const player = entities.find(e => e.components.PlayerTag);
    const state = player?.components.AbilityState;

    if (!scene.targetGfx) {
        scene.targetGfx = scene.add.graphics().setDepth(1400);
    }
    scene.targetGfx.clear();

    if (!state || !state.armed) return;

    entities.forEach(e => {
        const pos = e.components.Position;
        // Check for EntityType OR PlatformTag
        if (!pos || (!e.components.EntityType && !e.components.PlatformTag)) return;

        if (state.potentialTargets.includes(e.id)) {
            const isCurrent = state.currentTargetId === e.id;

            if (isCurrent) {
                // Active Web Target: Bright Orange Ring
                scene.targetGfx.lineStyle(3, 0xffa500, 1.0);
                const radius = e.components.Collider?.radius || 15;
                scene.targetGfx.strokeCircle(pos.x, pos.y, radius + 5);
            } else {
                // Potential Web Target: Dark Orange / Brown
                scene.targetGfx.lineStyle(2, 0x8b4513, 0.6);
                const radius = e.components.Collider?.radius || 15;
                scene.targetGfx.strokeCircle(pos.x, pos.y, radius + 2);
            }
        }
    });
};
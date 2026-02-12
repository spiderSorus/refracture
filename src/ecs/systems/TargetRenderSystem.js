export const TargetRenderSystem = (entities, scene) => {
    const player = entities.find(e => e.components.PlayerTag);
    const state = player?.components.AbilityState;

    if (!scene.targetGfx) {
        scene.targetGfx = scene.add.graphics().setDepth(1400);
    }
    scene.targetGfx.clear();

    // Only draw if we are actively arming an ability
    if (!state || !state.armed) return;

    entities.forEach(e => {
        const pos = e.components.Position;
        if (!pos || !e.components.EntityType) return;

        if (state.potentialTargets.includes(e.id)) {
            const isCurrent = state.currentTargetId === e.id;

            if (isCurrent) {
                // Active Target: Green Ring
                scene.targetGfx.lineStyle(2, 0x00ff00, 1.0);
                scene.targetGfx.strokeCircle(pos.x, pos.y, 15);
            } else {
                // Potential Targets: Light Grey Square
                scene.targetGfx.lineStyle(1, 0xaaaaaa, 0.4);
                scene.targetGfx.strokeRect(pos.x - 8, pos.y - 8, 16, 16);
            }
        }
    });
};
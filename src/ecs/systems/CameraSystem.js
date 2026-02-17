export const CameraSystem = (entities, scene) => {
    const cam = scene.cameras.main;
    const player = entities.find(e => e.components.PlayerTag && e.components.Position);

    // 1. No Player? Look at 0,0
    if (!player) {
        cam.centerOn(0, 0); // Or pan smoothly: cam.pan(0, 0, 1000);
        return;
    }

    const pPos = player.components.Position;
    let targetX = pPos.x;
    let targetY = pPos.y;

    // 2. Check for Active Target (Midpoint Logic)
    const abilityState = player.components.AbilityState;
    if (abilityState && abilityState.currentTargetId) {
        const target = entities.find(e => e.id === abilityState.currentTargetId);

        if (target && target.components.Position) {
            const tPos = target.components.Position;
            // Calculate Midpoint
            targetX = (pPos.x + tPos.x) / 2;
            targetY = (pPos.y + tPos.y) / 2;
        }
    }

    // 3. Move Camera
    // Lerp 0.1 gives a "spring" snap. Set to 1.0 for instant 1-frame snap.
    const lerp = 0.1;

    // Current camera center
    const currentX = cam.scrollX + cam.width / 2;
    const currentY = cam.scrollY + cam.height / 2;

    // Interpolate
    const newX = currentX + (targetX - currentX) * lerp;
    const newY = currentY + (targetY - currentY) * lerp;

    cam.centerOn(newX, newY);
};
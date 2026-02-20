export const SlingshotRenderSystem = (entities, scene) => {
    if (!scene.slingGfx) {
        scene.slingGfx = scene.add.graphics().setDepth(1500);
    }
    scene.slingGfx.clear();

    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    const pos = player.components.Position;

    if (sling.isCharging && pos) {
        // Visual length of the line maxes out at 150 pixels
        const drawLen = sling.chargeRatio * 150;

        const mag = Math.sqrt(sling.vector.x * sling.vector.x + sling.vector.y * sling.vector.y);
        const dirX = -sling.vector.x / mag;
        const dirY = -sling.vector.y / mag;

        const endX = pos.x + dirX * drawLen;
        const endY = pos.y + dirY * drawLen;

        // Draw Line
        scene.slingGfx.lineStyle(4, 0xffffff, 0.8);
        scene.slingGfx.beginPath();
        scene.slingGfx.moveTo(pos.x, pos.y);
        scene.slingGfx.lineTo(endX, endY);
        scene.slingGfx.strokePath();

        // Draw Aim Dot
        scene.slingGfx.fillStyle(0xff8400, 1.0);
        scene.slingGfx.fillCircle(endX, endY, 6);
    }
};
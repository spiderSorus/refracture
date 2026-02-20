// src/ecs/systems/SlingshotRenderSystem.js
export const SlingshotRenderSystem = (entities, scene) => {
    if (!scene.slingGfx) {
        scene.slingGfx = scene.add.graphics().setDepth(2000);
    }
    scene.slingGfx.clear();

    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    const pos = player.components.Position;

    // Use isCharging to determine visibility
    if (sling.isCharging && sling.vector && (sling.vector.x !== 0 || sling.vector.y !== 0)) {
        const indicatorLen = 80;

        // Direction is the inverse of the pull
        const endX = pos.x + (-sling.vector.x * indicatorLen);
        const endY = pos.y + (-sling.vector.y * indicatorLen);

        scene.slingGfx.lineStyle(3, 0x00ffff, 0.6);
        scene.slingGfx.beginPath();
        scene.slingGfx.moveTo(pos.x, pos.y);
        scene.slingGfx.lineTo(endX, endY);
        scene.slingGfx.strokePath();

        scene.slingGfx.fillStyle(0x00ffff, 1);
        scene.slingGfx.fillCircle(endX, endY, 5);
    }
};
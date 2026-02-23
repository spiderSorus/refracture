// src/ecs/systems/SlingshotRenderSystem.js
import { getImmediateGfx } from '../../utils/RenderUtils';

export const SlingshotRenderSystem = (entities, scene) => {
    const gfx = getImmediateGfx(scene, 'slingGfx', 2000);

    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    const pos = player.components.Position;

    if (sling.isCharging && sling.lockedAim) {
        // Use peak magnitude to show how much force is stored
        const forceRatio = Math.min(1.0, sling.peakMagnitude);
        const indicatorLen = 20 + (80 * forceRatio);

        const endX = pos.x + (-sling.lockedAim.x * indicatorLen);
        const endY = pos.y + (-sling.lockedAim.y * indicatorLen);

        const alpha = 0.3 + (0.5 * forceRatio);
        gfx.lineStyle(3, 0x00ffff, alpha);
        gfx.beginPath();
        gfx.moveTo(pos.x, pos.y);
        gfx.lineTo(endX, endY);
        gfx.strokePath();

        gfx.fillStyle(0x00ffff, 1);
        gfx.fillCircle(endX, endY, 5);
    }
};
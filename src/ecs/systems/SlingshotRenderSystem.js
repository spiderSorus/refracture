// src/ecs/systems/SlingshotRenderSystem.js
import { getImmediateGfx } from '../../utils/RenderUtils';

export const SlingshotRenderSystem = (entities, scene) => {
    const gfx = getImmediateGfx(scene, 'slingGfx', 2000);

    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    // REALITY FILTER: Player only sees their own slingshot if they are visible
    // (Player is always visible to self in LayeredRenderSystem, so we show this too)

    const sling = player.components.SlingshotJump;
    const pos = player.components.Position;

    if (sling.isCharging && sling.lockedAim) {
        // Use peak magnitude to show how much force is stored
        const forceRatio = Math.min(1.0, sling.peakMagnitude);
        const indicatorLen = 20 + (80 * forceRatio);

        const endX = pos.x + (-sling.lockedAim.x * indicatorLen);
        const endY = pos.y + (-sling.lockedAim.y * indicatorLen);

        const alpha = 0.3 + (0.5 * forceRatio);
        
        // USE DIFFERENCE BLEND MODE FOR CONTRAST
        gfx.setBlendMode('DIFFERENCE');
        
        gfx.lineStyle(3, 0xffffff, alpha);
        gfx.beginPath();
        gfx.moveTo(pos.x, pos.y);
        gfx.lineTo(endX, endY);
        gfx.strokePath();

        gfx.fillStyle(0xffffff, 1);
        gfx.fillCircle(endX, endY, 5);
    }
};
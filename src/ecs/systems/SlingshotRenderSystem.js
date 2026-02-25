// src/ecs/systems/SlingshotRenderSystem.js
import { getImmediateGfx } from '../../utils/RenderUtils';

export const SlingshotRenderSystem = (entities, scene, interpAlpha = 1.0) => {
    const gfx = getImmediateGfx(scene, 'slingGfx', 2000, scene.fgLayer);

    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    const pos = player.components.Position;
    const renderX = pos.prevX !== undefined ? pos.prevX + (pos.x - pos.prevX) * interpAlpha : pos.x;
    const renderY = pos.prevY !== undefined ? pos.prevY + (pos.y - pos.prevY) * interpAlpha : pos.y;

    if (sling.isCharging && sling.lockedAim) {
        // Use peak magnitude to show how much force is stored
        const forceRatio = Math.min(1.0, sling.peakMagnitude);
        const indicatorLen = 20 + (80 * forceRatio);

        const endX = renderX + (-sling.lockedAim.x * indicatorLen);
        const endY = renderY + (-sling.lockedAim.y * indicatorLen);

        const alpha = 0.3 + (0.5 * forceRatio);
        
        // USE DIFFERENCE BLEND MODE FOR CONTRAST
        gfx.setBlendMode('DIFFERENCE');
        
        gfx.lineStyle(3, 0xffffff, alpha);
        gfx.beginPath();
        gfx.moveTo(renderX, renderY);
        gfx.lineTo(endX, endY);
        gfx.strokePath();

        gfx.fillStyle(0xffffff, 1);
        gfx.fillCircle(endX, endY, 5);
    }
};
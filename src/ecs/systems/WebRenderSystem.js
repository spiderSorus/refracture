import Phaser from 'phaser';
import { getImmediateGfx } from '../../utils/RenderUtils';

export const WebRenderSystem = (entities, scene, interpAlpha = 1.0) => {
    const targetLayer = scene.auxLayers && scene.auxLayers['web_rainbow'] ? scene.auxLayers['web_rainbow'] : scene.fgLayer;
    const gfx = getImmediateGfx(scene, 'webGfx', 1100, targetLayer);
    const cam = scene.cameras.main;
    const thickness = 2 / cam.zoom;

    const getInterpPos = (pos) => ({
        x: pos.prevX !== undefined ? pos.prevX + (pos.x - pos.prevX) * interpAlpha : pos.x,
        y: pos.prevY !== undefined ? pos.prevY + (pos.y - pos.prevY) * interpAlpha : pos.y
    });

    // --- PART 1: COMPLETED SLACK WEBS ---
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);

            if (entA && entB && entA.components.Position && entB.components.Position) {
                const posA = getInterpPos(entA.components.Position);
                const posB = getInterpPos(entB.components.Position);

                // ACCOUNT FOR ROTATION OF BOTH PLATFORMS
                const rotA = entA.components.Rotation?.angle || 0;
                const rotB = entB.components.Rotation?.angle || 0;

                const ax = conn.fromOffset.x * Math.cos(rotA) - conn.fromOffset.y * Math.sin(rotA);
                const ay = conn.fromOffset.x * Math.sin(rotA) + conn.fromOffset.y * Math.cos(rotA);
                const bx = conn.toOffset.x * Math.cos(rotB) - conn.toOffset.y * Math.sin(rotB);
                const by = conn.toOffset.x * Math.sin(rotB) + conn.toOffset.y * Math.cos(rotB);

                const worldX1 = posA.x + ax;
                const worldY1 = posA.y + ay;
                const worldX2 = posB.x + bx;
                const worldY2 = posB.y + by;

                const dist = Phaser.Math.Distance.Between(worldX1, worldY1, worldX2, worldY2);
                const ropeLength = conn.fixedLength || dist;

                gfx.lineStyle(thickness, 0xffffff, 0.8);
                gfx.beginPath();
                gfx.moveTo(worldX1, worldY1);

                if (ropeLength <= dist + 1) {
                    gfx.lineTo(worldX2, worldY2);
                } else {
                    const segments = 15;
                    const slack = (ropeLength - dist) * 0.5;
                    for (let i = 1; i <= segments; i++) {
                        const t = i / segments;
                        const cx = worldX1 + (worldX2 - worldX1) * t;
                        const cy = worldY1 + (worldY2 - worldY1) * t;
                        const dip = 4 * t * (1 - t) * slack;
                        gfx.lineTo(cx, cy + dip);
                    }
                }
                gfx.strokePath();

                gfx.fillStyle(0xffffff, 1);
                gfx.fillCircle(worldX1, worldY1, 2 / cam.zoom);
                gfx.fillCircle(worldX2, worldY2, 2 / cam.zoom);
            }
        }
    });

    // --- PART 2: ACTIVE WHITE TETHER ---
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;
    const tether = player.components.WebTether;
    const pPosComp = player.components.Position;

    if (tether && pPosComp) {
        const platform = entities.find(e => e.id === tether.platformId);
        if (platform && platform.components.Position) {
            const pPos = getInterpPos(pPosComp);
            const platPos = getInterpPos(platform.components.Position);

            // ACCOUNT FOR ROTATION OF THE TETHERED PLATFORM
            const platRot = platform.components.Rotation?.angle || 0;
            const ax_local = tether.anchorOffset.x;
            const ay_local = tether.anchorOffset.y;

            const ax = ax_local * Math.cos(platRot) - ay_local * Math.sin(platRot);
            const ay = ax_local * Math.sin(platRot) + ay_local * Math.cos(platRot);

            const worldAX = platPos.x + ax;
            const worldAY = platPos.y + ay;
            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, worldAX, worldAY);

            gfx.lineStyle(thickness, 0xffffff, 0.8);
            gfx.beginPath();
            gfx.moveTo(worldAX, worldAY);

            if (dist >= tether.maxLength - 1) {
                gfx.lineTo(pPos.x, pPos.y);
            } else {
                const segments = 10;
                const slack = (tether.maxLength - dist) * 0.5;
                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const cx = worldAX + (pPos.x - worldAX) * t;
                    const cy = worldAY + (pPos.y - worldAY) * t;
                    gfx.lineTo(cx, cy + (4 * t * (1 - t) * slack));
                }
            }
            gfx.strokePath();
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(worldAX, worldAY, 4 / cam.zoom);
        }
    }
};

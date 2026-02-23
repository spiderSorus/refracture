import Phaser from 'phaser';
import { getImmediateGfx } from '../../utils/RenderUtils';
import { getAnchorWorldPos } from '../../utils/WebUtils';

export const WebRenderSystem = (entities, scene) => {
    const gfx = getImmediateGfx(scene, 'webGfx', 1100);
    const cam = scene.cameras.main;
    const thickness = 2 / cam.zoom;

    // --- PART 1: COMPLETED SLACK WEBS ---
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const p1 = getAnchorWorldPos(entities, conn.fromId, conn.fromOffset);
            const p2 = getAnchorWorldPos(entities, conn.toId, conn.toOffset);

            if (p1 && p2) {
                const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
                const ropeLength = conn.fixedLength || dist;

                gfx.lineStyle(thickness, 0xaaaaaa, 0.8);
                gfx.beginPath();
                gfx.moveTo(p1.x, p1.y);

                if (ropeLength <= dist + 1) {
                    gfx.lineTo(p2.x, p2.y);
                } else {
                    const segments = 15;
                    const slack = (ropeLength - dist) * 0.5;
                    for (let i = 1; i <= segments; i++) {
                        const t = i / segments;
                        const cx = p1.x + (p2.x - p1.x) * t;
                        const cy = p1.y + (p2.y - p1.y) * t;
                        const dip = 4 * t * (1 - t) * slack;
                        gfx.lineTo(cx, cy + dip);
                    }
                }
                gfx.strokePath();

                // Draw end bolts
                gfx.fillStyle(0xaaaaaa, 1);
                gfx.fillCircle(p1.x, p1.y, 2 / cam.zoom);
                gfx.fillCircle(p2.x, p2.y, 2 / cam.zoom);
            }
        }
    });

    // --- PART 2: ACTIVE WHITE TETHER ---
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;
    const tether = player.components.WebTether;
    const pPos = player.components.Position;

    if (tether && pPos) {
        const anchor = getAnchorWorldPos(entities, tether.platformId, tether.anchorOffset);
        if (anchor) {
            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, anchor.x, anchor.y);

            gfx.lineStyle(thickness, 0xffffff, 0.8);
            gfx.beginPath();
            gfx.moveTo(anchor.x, anchor.y);

            if (dist >= tether.maxLength - 1) {
                gfx.lineTo(pPos.x, pPos.y);
            } else {
                const segments = 10;
                const slack = (tether.maxLength - dist) * 0.5;
                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const cx = anchor.x + (pPos.x - anchor.x) * t;
                    const cy = anchor.y + (pPos.y - anchor.y) * t;
                    gfx.lineTo(cx, cy + (4 * t * (1 - t) * slack));
                }
            }
            gfx.strokePath();
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(anchor.x, anchor.y, 4 / cam.zoom);
        }
    }
};

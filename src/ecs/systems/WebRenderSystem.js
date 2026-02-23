import Phaser from 'phaser';
import { getImmediateGfx } from '../../utils/RenderUtils';

export const WebRenderSystem = (entities, scene) => {
    const gfx = getImmediateGfx(scene, 'webGfx', 1100);
    const cam = scene.cameras.main;
    const thickness = 2 / cam.zoom;

    // --- PART 1: COMPLETED SLACK WEBS ---
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const fromEnt = entities.find(ent => ent.id === conn.fromId);
            const toEnt = entities.find(ent => ent.id === conn.toId);

            if (fromEnt && toEnt && fromEnt.components.Position && toEnt.components.Position) {
                const x1 = fromEnt.components.Position.x + conn.fromOffset.x;
                const y1 = fromEnt.components.Position.y + conn.fromOffset.y;
                const x2 = toEnt.components.Position.x + conn.toOffset.x;
                const y2 = toEnt.components.Position.y + conn.toOffset.y;

                const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
                const ropeLength = conn.fixedLength || dist;

                gfx.lineStyle(thickness, 0xaaaaaa, 0.8);
                gfx.beginPath();
                gfx.moveTo(x1, y1);

                if (ropeLength <= dist + 1) {
                    gfx.lineTo(x2, y2);
                } else {
                    const segments = 15;
                    const slack = (ropeLength - dist) * 0.5;
                    for (let i = 1; i <= segments; i++) {
                        const t = i / segments;
                        const cx = x1 + (x2 - x1) * t;
                        const cy = y1 + (y2 - y1) * t;
                        const dip = 4 * t * (1 - t) * slack;
                        gfx.lineTo(cx, cy + dip);
                    }
                }
                gfx.strokePath();

                // Draw end bolts
                gfx.fillStyle(0xaaaaaa, 1);
                gfx.fillCircle(x1, y1, 2 / cam.zoom);
                gfx.fillCircle(x2, y2, 2 / cam.zoom);
            }
        }
    });

    // --- PART 2: ACTIVE WHITE TETHER ---
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;
    const tether = player.components.WebTether;
    const pPos = player.components.Position;

    if (tether && pPos) {
        const platform = entities.find(e => e.id === tether.platformId);
        if (platform && platform.components.Position) {
            const ax = platform.components.Position.x + tether.anchorOffset.x;
            const ay = platform.components.Position.y + tether.anchorOffset.y;
            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, ax, ay);

            gfx.lineStyle(thickness, 0xffffff, 0.8);
            gfx.beginPath();
            gfx.moveTo(ax, ay);

            if (dist >= tether.maxLength - 1) {
                gfx.lineTo(pPos.x, pPos.y);
            } else {
                const segments = 10;
                const slack = (tether.maxLength - dist) * 0.5;
                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const cx = ax + (pPos.x - ax) * t;
                    const cy = ay + (pPos.y - ay) * t;
                    gfx.lineTo(cx, cy + (4 * t * (1 - t) * slack));
                }
            }
            gfx.strokePath();
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(ax, ay, 4 / cam.zoom);
        }
    }
};

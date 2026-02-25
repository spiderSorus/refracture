import Phaser from 'phaser';
import { applyWebEffect, cleanupWebEffects } from '../../web_effects/index';

export const WebRenderSystem = (entities, scene, delta, interpAlpha = 1.0) => {
    const activeIds = new Set();

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

                const rotA = entA.components.Rotation?.angle || 0;
                const rotB = entB.components.Rotation?.angle || 0;

                const ax = conn.fromOffset.x * Math.cos(rotA) - conn.fromOffset.y * Math.sin(rotA);
                const ay = conn.fromOffset.x * Math.sin(rotA) + conn.fromOffset.y * Math.cos(rotA);
                const bx = conn.toOffset.x * Math.cos(rotB) - conn.toOffset.y * Math.sin(rotB);
                const by = conn.toOffset.x * Math.sin(rotB) + conn.toOffset.y * Math.cos(rotB);

                const x1 = posA.x + ax;
                const y1 = posA.y + ay;
                const x2 = posB.x + bx;
                const y2 = posB.y + by;

                activeIds.add(e.id);
                applyWebEffect(conn.effect || 'silk', scene, {
                    id: e.id,
                    x1, y1, x2, y2,
                    tension: conn.tension,
                    maxLength: conn.fixedLength,
                    currentLength: Phaser.Math.Distance.Between(x1, y1, x2, y2),
                    isTether: false,
                    dt: delta
                });
            }
        }
    });

    // --- PART 2: ACTIVE TETHER ---
    const player = entities.find(e => e.components.PlayerTag);
    if (player) {
        const tether = player.components.WebTether;
        const pPosComp = player.components.Position;

        if (tether && pPosComp) {
            const platform = entities.find(e => e.id === tether.platformId);
            if (platform && platform.components.Position) {
                const pPos = getInterpPos(pPosComp);
                const platPos = getInterpPos(platform.components.Position);
                const platRot = platform.components.Rotation?.angle || 0;

                const ax = tether.anchorOffset.x * Math.cos(platRot) - tether.anchorOffset.y * Math.sin(platRot);
                const ay = tether.anchorOffset.x * Math.sin(platRot) + tether.anchorOffset.y * Math.cos(platRot);

                const worldAX = platPos.x + ax;
                const worldAY = platPos.y + ay;

                activeIds.add(player.id + '_tether');
                applyWebEffect(tether.effect || 'silk', scene, {
                    id: player.id + '_tether',
                    x1: worldAX, y1: worldAY,
                    x2: pPos.x, y2: pPos.y,
                    tension: tether.tension,
                    maxLength: tether.maxLength,
                    currentLength: Phaser.Math.Distance.Between(pPos.x, pPos.y, worldAX, worldAY),
                    isTether: true,
                    dt: delta
                });
            }
        }
    }

    // --- CLEANUP ---
    cleanupWebEffects(scene, activeIds);
};

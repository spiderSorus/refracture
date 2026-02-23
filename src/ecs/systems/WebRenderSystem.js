// src/ecs/systems/WebRenderSystem.js
import Phaser from 'phaser';

export const WebRenderSystem = (entities, scene) => {
    if (!scene.webGfx) {
        scene.webGfx = scene.add.graphics().setDepth(1100);
    }
    scene.webGfx.clear();
    const cam = scene.cameras.main;
    const thickness = 2 / cam.zoom;

    // --- PART 1: DRAW COMPLETED WEBS ---
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const fromEnt = entities.find(ent => ent.id === conn.fromId);
            const toEnt = entities.find(ent => ent.id === conn.toId);

            if (fromEnt && toEnt) {
                const x1 = fromEnt.components.Position.x + conn.fromOffset.x;
                const y1 = fromEnt.components.Position.y + conn.fromOffset.y;
                const x2 = toEnt.components.Position.x + conn.toOffset.x;
                const y2 = toEnt.components.Position.y + conn.toOffset.y;

                scene.webGfx.lineStyle(thickness, 0xaaaaaa, 0.8);
                scene.webGfx.beginPath();
                scene.webGfx.moveTo(x1, y1);
                scene.webGfx.lineTo(x2, y2);
                scene.webGfx.strokePath();

                scene.webGfx.fillStyle(0xaaaaaa, 1);
                scene.webGfx.fillCircle(x1, y1, 3 / cam.zoom);
                scene.webGfx.fillCircle(x2, y2, 3 / cam.zoom);
            }
        }
    });

    // --- PART 2: DRAW ACTIVE TETHER ---
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;

    const tether = player.components.WebTether;
    const pPos = player.components.Position;
    const pVel = player.components.Velocity;

    if (tether && pPos) {
        const platform = entities.find(e => e.id === tether.platformId);
        if (platform && platform.components.Position) {
            const anchorX = platform.components.Position.x + tether.anchorOffset.x;
            const anchorY = platform.components.Position.y + tether.anchorOffset.y;

            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, anchorX, anchorY);
            const isTaut = dist >= (tether.maxLength - 1);

            // REMOVED THE COLOR CHANGE. ALWAYS WHITE.
            scene.webGfx.lineStyle(thickness, 0xffffff, 0.8);
            scene.webGfx.beginPath();
            scene.webGfx.moveTo(anchorX, anchorY);

            if (isTaut) {
                scene.webGfx.lineTo(pPos.x, pPos.y);
            } else {
                const segments = 10;
                const slack = (tether.maxLength - dist) * 0.5;

                let dragX = 0; let dragY = 0;
                if (pVel) {
                    dragX = -pVel.x * 0.04;
                    dragY = -pVel.y * 0.04;
                }

                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const currX = Phaser.Math.Interpolation.Linear([anchorX, pPos.x], t);
                    const currY = Phaser.Math.Interpolation.Linear([anchorY, pPos.y], t);
                    const arc = 4 * t * (1 - t);

                    scene.webGfx.lineTo(currX + (dragX * arc), currY + ((slack + dragY) * arc));
                }
            }

            scene.webGfx.strokePath();
            scene.webGfx.fillStyle(0xffffff, 1);
            scene.webGfx.fillCircle(anchorX, anchorY, 4 / cam.zoom);
        }
    }
};
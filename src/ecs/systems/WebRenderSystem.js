import Phaser from 'phaser';

export const WebRenderSystem = (entities, scene) => {
    if (!scene.webGfx) {
        scene.webGfx = scene.add.graphics().setDepth(1100);
    }
    scene.webGfx.clear();
    const cam = scene.cameras.main;
    const thickness = 2 / cam.zoom;

    // --- PART 1: DRAW COMPLETED WEBS (Static) ---
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const fromEnt = entities.find(ent => ent.id === conn.fromId);
            const toEnt = entities.find(ent => ent.id === conn.toId);

            // Only draw if both platforms still exist
            if (fromEnt && toEnt) {
                const fPos = fromEnt.components.Position;
                const tPos = toEnt.components.Position;

                const x1 = fPos.x + conn.fromOffset.x;
                const y1 = fPos.y + conn.fromOffset.y;
                const x2 = tPos.x + conn.toOffset.x;
                const y2 = tPos.y + conn.toOffset.y;

                // Static webs are Silver/Grey
                scene.webGfx.lineStyle(thickness, 0xaaaaaa, 0.8);
                scene.webGfx.beginPath();
                scene.webGfx.moveTo(x1, y1);
                scene.webGfx.lineTo(x2, y2);
                scene.webGfx.strokePath();

                // Draw Anchor Dots
                scene.webGfx.fillStyle(0xaaaaaa, 1);
                scene.webGfx.fillCircle(x1, y1, 3 / cam.zoom);
                scene.webGfx.fillCircle(x2, y2, 3 / cam.zoom);
            }
        }
    });

    // --- PART 2: DRAW ACTIVE TETHER (Dynamic) ---
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;

    const tether = player.components.WebTether;

    if (tether) {
        const platform = entities.find(e => e.id === tether.platformId);
        if (platform) {
            const platPos = platform.components.Position;
            const anchorX = platPos.x + tether.anchorOffset.x;
            const anchorY = platPos.y + tether.anchorOffset.y;

            const pPos = player.components.Position;

            // Active web is Orange
            scene.webGfx.lineStyle(thickness, 0xffa500, 1.0);
            scene.webGfx.beginPath();
            scene.webGfx.moveTo(anchorX, anchorY);
            scene.webGfx.lineTo(pPos.x, pPos.y);
            scene.webGfx.strokePath();

            // Anchor point
            scene.webGfx.fillStyle(0xffa500, 1);
            scene.webGfx.fillCircle(anchorX, anchorY, 4 / cam.zoom);
        }
    }
};
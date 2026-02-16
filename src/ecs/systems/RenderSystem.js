export const RenderSystem = (entities, scene) => {
    if (!scene.gfx) {
        // High base depth for the ECS graphics layer
        scene.gfx = scene.add.graphics().setDepth(1000);
    }
    scene.gfx.clear();

    // 1. Sort entities so Player is always drawn last (on top)
    const sortedEntities = [...entities].sort((a, b) => {
        const aIsPlayer = a.components.PlayerTag ? 1 : 0;
        const bIsPlayer = b.components.PlayerTag ? 1 : 0;
        return aIsPlayer - bIsPlayer;
    });

    sortedEntities.forEach(entity => {
        const { Position: pos, Graphic: gfx, Rotation: rot, PlayerTag: isPlayer, Collider: col } = entity.components;

        if (!pos || !gfx || gfx.texture === 'none') return;

        const color = gfx.color || 0xffffff;
        const angle = (rot && !isNaN(rot.angle)) ? rot.angle : 0;

        scene.gfx.save();
        scene.gfx.translateCanvas(pos.x, pos.y);
        scene.gfx.rotateCanvas(angle);

        // 2. Set alpha/style
        // We can make platforms slightly transparent so the player is even clearer
        const alpha = isPlayer ? 1.0 : 0.8;
        scene.gfx.fillStyle(color, alpha);
        scene.gfx.lineStyle(2, 0xffffff, isPlayer ? 1.0 : 0.5);

        if (isPlayer) {
            const size = gfx.size || 12;
            scene.gfx.beginPath();
            scene.gfx.moveTo(size, 0);
            scene.gfx.lineTo(-size, -size);
            scene.gfx.lineTo(-size, size);
            scene.gfx.closePath();
            scene.gfx.fillPath();
            scene.gfx.strokePath();
        } else {
            if (gfx.texture === 'circle') {
                const r = col ? col.radius : (gfx.size || 8);
                scene.gfx.fillCircle(0, 0, r);
                scene.gfx.strokeCircle(0, 0, r);
            } else {
                const w = col ? col.width : (gfx.size ? gfx.size * 2 : 12);
                const h = col ? col.height : (gfx.size ? gfx.size * 2 : 12);
                scene.gfx.fillRect(-w / 2, -h / 2, w, h);
                scene.gfx.strokeRect(-w / 2, -h / 2, w, h);
            }
        }
        scene.gfx.restore();
    });
};
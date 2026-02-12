export const RenderSystem = (entities, scene) => {
    if (!scene.gfx) {
        scene.gfx = scene.add.graphics().setDepth(100);
    }
    scene.gfx.clear();

    entities.forEach(entity => {
        const { Position: pos, Graphic: gfx, Rotation: rot, PlayerTag: isPlayer } = entity.components;
        if (!pos || !gfx) return;

        const color = gfx.color || 0xffffff;
        const angle = rot ? rot.angle : 0;

        scene.gfx.fillStyle(color, 1);
        scene.gfx.lineStyle(2, 0xffffff, 0.5);

        scene.gfx.save();
        scene.gfx.translateCanvas(pos.x, pos.y);
        scene.gfx.rotateCanvas(angle);

        if (isPlayer) {
            // Draw Triangle pointing Right (0 radians)
            // Points are relative to the translated center
            const size = 12;
            scene.gfx.beginPath();
            scene.gfx.moveTo(size, 0);          // Tip
            scene.gfx.lineTo(-size, -size);     // Bottom Left
            scene.gfx.lineTo(-size, size);      // Bottom Right
            scene.gfx.closePath();
            scene.gfx.fillPath();
            scene.gfx.strokePath();
        } else {
            // Draw standard shapes
            if (gfx.texture === 'circle') {
                scene.gfx.fillCircle(0, 0, 8);
                scene.gfx.strokeCircle(0, 0, 8);
            } else {
                scene.gfx.fillRect(-6, -6, 12, 12);
                scene.gfx.strokeRect(-6, -6, 12, 12);
            }
        }

        scene.gfx.restore();
    });
};
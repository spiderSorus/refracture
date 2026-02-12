export const RenderSystem = (entities, scene) => {
    entities.forEach(entity => {
        const gfx = entity.components.Graphic;
        const pos = entity.components.Position;

        if (gfx && pos && !gfx.sprite) {
            // Procedural Circle
            if (gfx.texture === 'circle') {
                if (!scene.textures.exists('procedural_circle')) {
                    const g = scene.make.graphics({ x: 0, y: 0, add: false });
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(16, 16, 16);
                    g.generateTexture('procedural_circle', 32, 32);
                }
                gfx.sprite = scene.add.sprite(pos.x, pos.y, 'procedural_circle');
            }
            // Procedural Rectangle
            else if (gfx.texture === 'rect') {
                if (!scene.textures.exists('procedural_rect')) {
                    const g = scene.make.graphics({ x: 0, y: 0, add: false });
                    g.fillStyle(0xffffff, 1);
                    g.fillRect(0, 0, 32, 32);
                    g.generateTexture('procedural_rect', 32, 32);
                }
                gfx.sprite = scene.add.sprite(pos.x, pos.y, 'procedural_rect');
            }

            if (gfx.sprite) gfx.sprite.setTint(gfx.color);
        }
    });
};
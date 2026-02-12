import { GRID } from '../../core/Constants';

export const RenderSystem = (entities, scene) => {
    entities.forEach(entity => {
        const gfx = entity.components.Graphic;
        const pos = entity.components.Position;

        if (gfx && pos && !gfx.sprite) {
            // All entities are now sized based on GRID.UNIT
            const size = GRID.UNIT;

            if (gfx.texture === 'circle') {
                if (!scene.textures.exists('unit_circle')) {
                    const g = scene.make.graphics({ x: 0, y: 0, add: false });
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(size / 2, size / 2, size / 2);
                    g.generateTexture('unit_circle', size, size);
                }
                gfx.sprite = scene.add.sprite(pos.x, pos.y, 'unit_circle');
            }
            else if (gfx.texture === 'rect') {
                if (!scene.textures.exists('unit_rect')) {
                    const g = scene.make.graphics({ x: 0, y: 0, add: false });
                    g.fillStyle(0xffffff, 1);
                    g.fillRect(0, 0, size, size);
                    g.generateTexture('unit_rect', size, size);
                }
                gfx.sprite = scene.add.sprite(pos.x, pos.y, 'unit_rect');
            }

            if (gfx.sprite) gfx.sprite.setTint(gfx.color);
        }
    });
};
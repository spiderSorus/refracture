import { BaseGraphic } from './BaseGraphic';

export class SpriteGraphic extends BaseGraphic {
    create(config) {
        return this.scene.add.text(0, 0, config.char || '?', {
            fontSize: '24px',
            color: config.color || '#ffffff'
        }).setOrigin(0.5);
    }

    onUpdate(config) {
        const intensity = config.intensity ?? 1.0;

        // Scale and Color react to intensity
        this.gameObject.setScale(config.size ?? 1 * intensity);

        if (config.color) {
            this.gameObject.setColor(config.color);
        }
    }
}
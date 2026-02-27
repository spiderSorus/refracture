import { BaseGraphic } from './BaseGraphic';

export class RectGraphic extends BaseGraphic {
    create(config) {
        const container = this.scene.add.container(0, 0);
        
        this.rect = this.scene.add.rectangle(
            0, 0,
            config.width || 32,
            config.height || 32,
            config.color || 0xffffff
        );

        if (config.alpha !== undefined) this.rect.setAlpha(config.alpha);
        this.rect.isFilled = true;

        if (config.strokeColor !== undefined) {
            this.rect.setStrokeStyle(config.strokeWidth || 1, config.strokeColor, config.strokeAlpha || 1.0);
        }
        
        container.add(this.rect);

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;

        const intensity = config.intensity ?? 1.0;
        const baseW = config.width || 32;
        const baseH = config.height || 32;

        this.rect.setSize(baseW, baseH);

        if (config.color !== undefined) {
            // Modulate color/alpha with intensity instead of size
            const alpha = (config.alpha ?? 1.0) * Phaser.Math.Clamp(intensity, 0.3, 1.0);
            this.rect.setFillStyle(config.color, alpha);
        }
    }
}
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
        
        container.add(this.rect);

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;

        const intensity = config.intensity ?? 1.0;
        const baseW = config.width || 32;
        const baseH = config.height || 32;

        let targetW = baseW * intensity;
        let targetH = baseH * intensity;

        if (intensity > 1.2) {
            const jitter = (intensity - 1.2) * 5;
            targetW += (Math.random() - 0.5) * jitter;
            targetH += (Math.random() - 0.5) * jitter;
        }

        this.rect.setSize(targetW, targetH);

        if (config.color !== undefined) {
            const alpha = config.alpha ?? this.rect.alpha;
            this.rect.setFillStyle(config.color, alpha);
        }
    }
}
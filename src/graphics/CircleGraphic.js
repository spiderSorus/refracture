import { BaseGraphic } from './BaseGraphic';

export class CircleGraphic extends BaseGraphic {
    create(config) {
        return this.scene.add.circle(0, 0, config.radius || 16, config.color || 0xffffff);
    }

    onUpdate(config) {
        const intensity = config.intensity ?? 1.0;
        const baseRadius = config.radius || 16;

        // Intensity drives a "vibration" effect
        if (intensity > 1.0) {
            const jitter = (intensity - 1.0) * 2;
            this.gameObject.setRadius(baseRadius + (Math.random() * jitter));
        } else {
            this.gameObject.setRadius(baseRadius * intensity);
        }
    }
}
import { BaseGraphic } from './BaseGraphic';

export class RectGraphic extends BaseGraphic {
    create(config) {
        const r = this.scene.add.rectangle(
            0, 0,
            config.width || 32,
            config.height || 32,
            config.color || 0xffffff
        );

        if (config.alpha !== undefined) r.setAlpha(config.alpha);
        r.isFilled = true;

        return r;
    }

    /**
     * Contract Implementation:
     * - intensity: Scales dimensions and adds "chaos" jitter at high values.
     * - color: Live updates the fill color.
     */
    onUpdate(config) {
        if (!this.gameObject) return;

        const intensity = config.intensity ?? 1.0;
        const baseW = config.width || 32;
        const baseH = config.height || 32;

        // 1. Reactive Scaling
        // At intensity 1.0, it is base size. At 0.0, it disappears.
        let targetW = baseW * intensity;
        let targetH = baseH * intensity;

        // 2. High-Intensity Jitter (The "Contract" for stress/energy)
        if (intensity > 1.2) {
            const jitter = (intensity - 1.2) * 5;
            targetW += (Math.random() - 0.5) * jitter;
            targetH += (Math.random() - 0.5) * jitter;
        }

        this.gameObject.setSize(targetW, targetH);

        // 3. Dynamic Coloring
        if (config.color !== undefined) {
            this.gameObject.setFillStyle(config.color, config.alpha ?? 1.0);
        }
    }
}
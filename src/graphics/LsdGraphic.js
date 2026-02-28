import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

/**
 * LsdGraphic
 * A graphic that applies a dynamic color-cycling LSD effect to a base shape.
 * Supports 'rect' and 'circle' shapes.
 */
export class LsdGraphic extends BaseGraphic {
    create(config) {
        const shapeType = config.shape || 'rect';
        const color = config.color || 0xffffff;
        const alpha = config.alpha !== undefined ? config.alpha : 1.0;
        const lsdSpeed = config.lsdSpeed || 0.01;

        let shape;

        if (shapeType === 'circle') {
            const radius = config.radius || 32;
            shape = this.scene.add.circle(0, 0, radius, color, alpha);
        } else {
            const width = config.width || 32;
            const height = config.height || 32;
            shape = this.scene.add.rectangle(0, 0, width, height, color, alpha);
        }

        // Apply the Phaser built-in LSD effect
        if (shape.preFX) {
            shape.preFX.addColorMatrix().lsd(lsdSpeed);
        }

        return shape;
    }

    onUpdate(config) {
        if (!this.gameObject) return;

        // Sync size if it changes (useful for dynamic platforms)
        if (config.shape === 'circle') {
            const radius = config.radius || 32;
            if (this.gameObject.setRadius) this.gameObject.setRadius(radius);
        } else {
            const width = config.width || 32;
            const height = config.height || 32;
            if (this.gameObject.setSize) this.gameObject.setSize(width, height);
        }

        if (config.color !== undefined && this.gameObject.setFillStyle) {
            this.gameObject.setFillStyle(config.color, config.alpha ?? 1.0);
        }
    }
}

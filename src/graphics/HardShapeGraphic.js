import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class HardShapeGraphic extends BaseGraphic {
    create(config) {
        const width = config.width || 20;
        const height = config.height || 200;
        const color = config.color || 0xffffff;
        const alpha = config.alpha ?? 1.0;
        const shape = config.shape || 'rect';
        
        let obj;
        if (shape === 'rect') {
            obj = this.scene.add.rectangle(0, 0, width, height, color, alpha);
        } else if (shape === 'circle') {
            obj = this.scene.add.circle(0, 0, width / 2, color, alpha);
        } else if (shape === 'ellipse') {
            obj = this.scene.add.ellipse(0, 0, width, height, color, alpha);
        } else {
            obj = this.scene.add.rectangle(0, 0, width, height, color, alpha);
        }

        return obj;
    }

    setAtmosphere(color, intensity) {
        if (this.gameObject && this.gameObject.setTintFill) {
            if (color === null || intensity <= 0) {
                this.gameObject.clearTint();
            } else {
                // Use TintFill to overwrite the base color with the atmospheric color
                // Phaser's tintFill uses 4 corners
                this.gameObject.setTintFill(color);
                this.gameObject.setFillAlpha(intensity);
            }
        }
    }

    onUpdate(config) {
        // Hard edges, no dynamic wobble requested for this specific type
    }
}

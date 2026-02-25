import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class FairyEmitterGraphic extends BaseGraphic {
    create(config) {
        if (!this.scene.textures.exists('wisp_glow')) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.generateTexture('wisp_glow', 16, 16);
        }

        // We return a simple invisible object as the main gameObject
        // so BaseGraphic.update can manage its position.
        const pivot = this.scene.add.container(0, 0);

        this.emitter = this.scene.add.particles(0, 0, 'wisp_glow', {
            speed: { min: 25, max: 75 },
            lifespan: { min: 1000, max: 2000 },
            scale: { start: 0.75, end: 0 },
            alpha: { start: config.alpha ?? 0.5, end: 0 },
            tint: config.tints || [0x00ffff, 0xffffff, 0x0000ff],
            blendMode: 'ADD',
            emitting: true,
            frequency: 15
        });

        return pivot;
    }

    onUpdate(config) {
        if (!this.emitter || !this.gameObject) return;
        
        // BaseGraphic.update sets this.gameObject position to world coordinates
        this.emitter.setPosition(this.gameObject.x, this.gameObject.y);
        
        const intensity = config.intensity ?? 1.0;
        this.emitter.frequency = Math.max(2, 20 / intensity);
    }

    setVisible(visible) {
        super.setVisible(visible);
        if (this.emitter) {
            this.emitter.setVisible(visible);
            this.emitter.paused = !visible;
        }
    }

    destroy() {
        if (this.emitter) {
            this.emitter.destroy();
            this.emitter = null;
        }
        super.destroy();
    }
}

import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';
import { GRID } from '../core/Constants';

export class FairyGlowGraphic extends BaseGraphic {
    create(config) {
        const radius = (config.size || 1) * GRID.UNIT;

        if (!this.scene.textures.exists('wisp_glow')) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.generateTexture('wisp_glow', 16, 16);
        }

        this.gameObject = this.scene.add.circle(0, 0, radius, config.coreColor || 0xff0000, 1);
        this.gameObject.setDepth(100);

        this.emitter = this.scene.add.particles(0, 0, 'wisp_glow', {
            speed: { min: 20, max: 50 },
            lifespan: { min: 2000, max: 4000 },
            frequency: 60,
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: config.tints || [0xff0000, 0xffffff],
            blendMode: 'ADD',
            emitting: true
        });

        this.emitter.setDepth(90);
        return this.gameObject;
    }

    onUpdate(config) {
        if (!this.gameObject || !this.emitter) return;

        const { x, y } = this.gameObject;
        this.emitter.setPosition(x, y);

        const intensity = config.intensity ?? 1.0;
        const time = Date.now() * 0.002;

        const updateProp = (prop, min, max) => {
            if (prop && typeof prop === 'object') {
                if (prop.hasOwnProperty('min')) prop.min = min;
                if (prop.hasOwnProperty('max')) prop.max = max;
            }
        };

        const baseSpeed = 40 * intensity;
        updateProp(this.emitter.speedX, -baseSpeed, baseSpeed);
        updateProp(this.emitter.speedY, -baseSpeed, baseSpeed);

        this.emitter.frequency = Math.max(5, 60 / intensity);

        this.emitter.forEachAlive((p) => {
            const noise = p.id || 0;
            p.vx += Math.cos(time + noise) * (0.8 * intensity);
            p.vy += Math.sin(time + noise) * (0.8 * intensity);

            const dx = p.x - x;
            const dy = p.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                const pushForce = (config.push ?? 0.3) * intensity;
                p.vx += (dx / dist) * pushForce;
                p.vy += (dy / dist) * pushForce;
            }
        });

        const baseRadius = (config.size || 1) * GRID.UNIT;
        this.gameObject.setRadius(baseRadius * (0.8 + intensity * 0.4));
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
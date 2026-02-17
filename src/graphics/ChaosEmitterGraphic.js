import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class ChaosEmitterGraphic extends BaseGraphic {
    create(config) {
        this.gameObject = this.scene.add.circle(0, 0, (config.size || 1) * 10, config.coreColor || 0xffff00, 0.2);
        this.gameObject.setDepth(100);

        this.tracerGfx = this.scene.add.graphics().setDepth(90);
        this.particles = [];
        this.spawnTimer = 0;
        return this.gameObject;
    }

    onUpdate(config) {
        if (!this.gameObject) return;

        const intensity = config.intensity ?? 1.0;
        this.spawnTimer++;

        const spawnRate = config.spawnRate ?? (10 / intensity);
        const maxParticles = config.maxParticles ?? (20 * intensity);

        if (this.spawnTimer > spawnRate && this.particles.length < maxParticles) {
            this.spawnParticle(config);
            this.spawnTimer = 0;
        }

        this.tracerGfx.clear();

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Chaos Jitter
            p.vx += (Math.random() - 0.5) * (config.jitter ?? 0.8) * intensity;
            p.vy += (Math.random() - 0.5) * (config.jitter ?? 0.8) * intensity;

            const dx = p.x - this.gameObject.x;
            const dy = p.y - this.gameObject.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                const pushForce = (config.push ?? 0.15) * intensity;
                p.vx += (dx / dist) * pushForce;
                p.vy += (dy / dist) * pushForce;

                // ABSORPTION KILL-ZONE: If push is negative, kill particle when it hits center
                if (pushForce < 0 && dist < 8) {
                    p.life = 0;
                }
            }

            p.vx *= (config.friction ?? 0.92);
            p.vy *= (config.friction ?? 0.92);

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 1;

            p.history.push({ x: p.x, y: p.y });
            if (p.history.length > (config.tailLen ?? 15)) p.history.shift();

            this.drawParticle(p, config, intensity);
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    drawParticle(p, config, intensity) {
        const alpha = (p.life / p.maxLife);
        if (p.history.length > 1) {
            this.tracerGfx.lineStyle(config.thickness ?? 1, config.tracerColor ?? 0xffa500, alpha);
            this.tracerGfx.beginPath();
            this.tracerGfx.moveTo(p.history[0].x, p.history[0].y);
            p.history.forEach(pos => this.tracerGfx.lineTo(pos.x, pos.y));
            this.tracerGfx.strokePath();
        }
        this.tracerGfx.fillStyle(config.headColor ?? 0x00ffff, alpha);
        this.tracerGfx.fillCircle(p.x, p.y, config.headSize ?? 2);
    }

    spawnParticle(config) {
        const life = 40 + Math.random() * 40;
        const push = config.push ?? 0.15;

        let sx = this.gameObject.x;
        let sy = this.gameObject.y;

        // If push is negative (Absorb), spawn in a ring around the center
        if (push < 0) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 30;
            sx += Math.cos(angle) * dist;
            sy += Math.sin(angle) * dist;
        }

        this.particles.push({
            x: sx, y: sy,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            history: [], life: life, maxLife: life
        });
    }

    destroy() {
        if (this.tracerGfx) this.tracerGfx.destroy();
        this.particles = [];
        super.destroy();
    }
}
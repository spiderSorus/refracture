import Phaser from 'phaser';

export class VoidEffect {
    constructor(scene) {
        this.scene = scene;
        this.gfx = scene.add.graphics();
        this.gfx.setDepth(1100);

        this.emitter = scene.add.particles(0, 0, 'web_sparkle', {
            speed: { min: 5, max: 15 },
            lifespan: 1000,
            scale: { start: 1, end: 0 },
            alpha: { start: 0.4, end: 0 },
            tint: [0x440088, 0x000000, 0xff00ff],
            blendMode: 'NORMAL',
            emitting: false
        });
        this.emitter.setDepth(1090); // Behind the line

        if (scene.fgLayer) {
            scene.fgLayer.add(this.gfx);
            scene.fgLayer.add(this.emitter);
        }
    }

    update(data) {
        const { x1, y1, x2, y2, maxLength, currentLength, dt } = data;
        const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        const cam = this.scene.cameras.main;
        const thickness = 4 / cam.zoom;

        if (!this.energyParticles) this.energyParticles = [];
        
        const dtFactor = dt / 16.66;
        const spawnChance = dtFactor * 0.03;
        if (Math.random() < spawnChance) {
            this.energyParticles.push({ 
                t: 0, 
                speed: 0.002 + Math.random() * 0.004,
                size: 4 + Math.random() * 6
            });
        }

        this.gfx.clear();
        this.gfx.lineStyle(thickness, 0x220044, 1.0);
        this.gfx.beginPath();
        this.gfx.moveTo(x1, y1);

        const targetLen = maxLength || currentLength;
        const points = [];

        if (targetLen <= dist + 1) {
            this.gfx.lineTo(x2, y2);
            for(let t=0; t<=1; t+=0.1) points.push({ x: x1 + (x2-x1)*t, y: y1 + (y2-y1)*t });
        } else {
            const segments = 20;
            const slack = (targetLen - dist) * 0.5;
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const cx = x1 + (x2 - x1) * t;
                const cy = y1 + (y2 - y1) * t;
                const dip = 4 * t * (1 - t) * slack;
                const py = cy + dip;
                this.gfx.lineTo(cx, py);
                points.push({ x: cx, y: py });
            }
        }
        this.gfx.strokePath();

        // Render traveling particles
        for (let i = this.energyParticles.length - 1; i >= 0; i--) {
            const p = this.energyParticles[i];
            p.t += p.speed * dtFactor;
            
            if (p.t > 1) {
                this.energyParticles.splice(i, 1);
                continue;
            }
            const pointIdx = Math.floor(p.t * (points.length - 1));
            const pt = points[pointIdx];
            if (pt) {
                const size = p.size / cam.zoom;
                this.gfx.fillStyle(0xff00ff, 1);
                this.gfx.fillRect(pt.x - size/2, pt.y - size/2, size, size); // Glitchy square
                this.gfx.fillStyle(0xff00ff, 0.3);
                this.gfx.fillRect(pt.x - size, pt.y - size, size * 2, size * 2);
            }
        }

        // Inner core
        this.gfx.lineStyle(thickness * 0.3, 0xff00ff, 0.8);
        this.gfx.strokePath();

        // Drip particles
        if (Math.random() < dtFactor * 0.2) {
            const p = points[Math.floor(Math.random() * points.length)];
            if (p) this.emitter.emitParticleAt(p.x, p.y);
        }
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        if (this.emitter) this.emitter.destroy();
    }
}

import Phaser from 'phaser';

export class SparkleEffect {
    constructor(scene) {
        this.scene = scene;
        this.gfx = scene.add.graphics();
        this.gfx.setDepth(1100);

        if (!scene.textures.exists('web_sparkle')) {
            const g = scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
            g.generateTexture('web_sparkle', 8, 8);
        }

        this.emitter = scene.add.particles(0, 0, 'web_sparkle', {
            speed: { min: 10, max: 30 },
            lifespan: { min: 400, max: 800 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [0xffffff, 0x00ffff, 0xffff00],
            blendMode: 'ADD',
            emitting: false
        });
        this.emitter.setDepth(1105);

        if (scene.fgLayer) {
            scene.fgLayer.add(this.gfx);
            scene.fgLayer.add(this.emitter);
        }
    }

    update(data) {
        const { x1, y1, x2, y2, maxLength, currentLength, dt } = data;
        const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        const cam = this.scene.cameras.main;
        const thickness = 3 / cam.zoom;

        if (!this.energyParticles) this.energyParticles = [];
        
        const dtFactor = dt / 16.66;
        const spawnChance = dtFactor * 0.04;
        if (Math.random() < spawnChance) {
            this.energyParticles.push({ 
                t: 0, 
                speed: 0.005 + Math.random() * 0.01,
                size: 3 + Math.random() * 5
            });
        }

        this.gfx.clear();
        this.gfx.lineStyle(thickness, 0x00ffff, 0.4);
        this.gfx.beginPath();
        this.gfx.moveTo(x1, y1);

        const targetLen = maxLength || currentLength;
        const points = [];

        if (targetLen <= dist + 1) {
            this.gfx.lineTo(x2, y2);
            for(let t=0; t<=1; t+=0.05) {
                points.push({ x: x1 + (x2-x1)*t, y: y1 + (y2-y1)*t });
            }
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
                const radius = p.size / cam.zoom;
                this.gfx.fillStyle(0xffff00, 1);
                this.gfx.fillCircle(pt.x, pt.y, radius);
                this.gfx.fillStyle(0xffffff, 0.5);
                this.gfx.fillCircle(pt.x, pt.y, radius * 2);
            }
        }

        // Emit sparkle particles along the points
        if (Math.random() < dtFactor * 0.3) {
            const p = points[Math.floor(Math.random() * points.length)];
            if (p) this.emitter.emitParticleAt(p.x, p.y);
        }
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        if (this.emitter) this.emitter.destroy();
    }
}

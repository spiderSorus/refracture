import Phaser from 'phaser';

export class SilkEffect {
    constructor(scene) {
        this.scene = scene;
        this.gfx = scene.add.graphics();
        // Use a high depth but ensure it's in the right layer if possible
        // BaseTestScene has fgLayer at 100
        this.gfx.setDepth(1100);
        
        if (scene.fgLayer) {
            scene.fgLayer.add(this.gfx);
        }
    }

    update(data) {
        const { x1, y1, x2, y2, maxLength, currentLength, tension, id, dt } = data;
        
        // Initialize energy state if not present
        if (!this.energyParticles) this.energyParticles = [];
        
        // Use dt to normalize spawning (baseline 60fps = 16.66ms)
        const spawnChance = (dt / 16.66) * 0.05;
        if (Math.random() < spawnChance) {
            this.energyParticles.push({ 
                t: 0, 
                speed: 0.003 + Math.random() * 0.007,
                size: 2 + Math.random() * 4
            });
        }

        const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        const cam = this.scene.cameras.main;
        const thickness = 2 / cam.zoom;

        this.gfx.clear();
        
        // Tension-based coloring (white to magenta)
        const tensionAlpha = Phaser.Math.Clamp(tension / 5000, 0, 1);
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0xffffff),
            Phaser.Display.Color.ValueToColor(0xff00ff), // Magenta
            1, tensionAlpha
        );
        const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

        this.gfx.lineStyle(thickness, hexColor, 0.8);
        this.gfx.beginPath();
        this.gfx.moveTo(x1, y1);

        const targetLen = maxLength || currentLength;
        const points = [];

        if (targetLen <= dist + 1) {
            this.gfx.lineTo(x2, y2);
            // Linear points for particles
            for(let i=0; i<=20; i++) points.push({ x: x1 + (x2-x1)*(i/20), y: y1 + (y2-y1)*(i/20) });
        } else {
            const segments = 15;
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
        const dtFactor = dt / 16.66;
        for (let i = this.energyParticles.length - 1; i >= 0; i--) {
            const p = this.energyParticles[i];
            p.t += p.speed * dtFactor;
            
            if (p.t > 1) {
                this.energyParticles.splice(i, 1);
                continue;
            }

            // Find position on the curve
            const pointIdx = Math.floor(p.t * (points.length - 1));
            const pt = points[pointIdx];
            if (pt) {
                const radius = p.size / cam.zoom;
                this.gfx.fillStyle(0x00ffff, 1);
                this.gfx.fillCircle(pt.x, pt.y, radius);
                
                // Outer glow for particle
                this.gfx.fillStyle(0x00ffff, 0.3);
                this.gfx.fillCircle(pt.x, pt.y, radius * 2);
            }
        }

        // Caps
        this.gfx.fillStyle(hexColor, 1);
        this.gfx.fillCircle(x1, y1, 3 / cam.zoom);
        this.gfx.fillCircle(x2, y2, 3 / cam.zoom);
    }

    destroy() {
        if (this.gfx) {
            this.gfx.destroy();
            this.gfx = null;
        }
    }
}

import { BaseGraphic } from './BaseGraphic';
import Phaser from 'phaser';

export class StemGraphic extends BaseGraphic {
    create(config) {
        return this.scene.add.graphics();
    }

    /**
     * Helper to draw a cubic bezier curve using line segments.
     */
    drawCubicBezier(graphics, p0, p1, p2, p3, steps = 24) {
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const mt = 1 - t;
            
            // Cubic Bezier formula: (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
            const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
            const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
            
            graphics.lineTo(x, y);
        }
    }

    onUpdate(config) {
        if (!this.gameObject) return;
        const graphics = this.gameObject;
        const time = this.scene.time.now * 0.0015;

        const thickness = config.width || 20;
        const length = config.height || 200;
        const color = config.color || 0x228B22;
        const alpha = config.alpha ?? 1.0;
        const stiffness = config.stiffness ?? 0.5; // 0 (bendy from base) to 1 (only tip bends)

        graphics.clear();
        graphics.fillStyle(color, alpha);
        graphics.lineStyle(2, 0x000000, 1.0);

        const halfL = length / 2;
        const halfT = thickness / 2;

        // --- STIFFNESS LOGIC ---
        // stiffness 0: Center is (0, halfL) [base], radius is length
        // stiffness 1: Center is (0, -halfL) [tip], radius is 0 (no movement)
        // Let's make it so radius = length * (1 - stiffness)
        const activeRadius = Math.max(10, length * (1 - stiffness));
        const circleCenterY = -halfL + activeRadius; // Offset from tip down to the center

        // Max swing angle (less swing if stiffer/shorter radius)
        const maxSwing = 0.8 * (1 - stiffness * 0.5);
        const swingAngle = Math.sin(time) * maxSwing;
        
        const p0 = { x: 0, y: halfL }; // Base Center (fixed)
        
        // p3 (Tip Center) relative to circleCenter
        const p3 = { 
            x: Math.sin(swingAngle) * activeRadius, 
            y: circleCenterY - Math.cos(swingAngle) * activeRadius 
        };

        // --- TIP CAP ORIENTATION ---
        // Tangent to circle centered at (0, circleCenterY)
        const relX = p3.x;
        const relY = p3.y - circleCenterY;
        const rx = relX / activeRadius;
        const ry = relY / activeRadius;

        const tx = -ry;
        const ty = rx;

        const pTipLeft  = { x: p3.x - tx * halfT, y: p3.y - ty * halfT };
        const pTipRight = { x: p3.x + tx * halfT, y: p3.y + ty * halfT };

        // --- SPINE CURVE ---
        // p1: Base tangent (Always vertical)
        const p1 = { x: 0, y: p0.y - length * 0.3 };
        
        // p2: Tip tangent (Perpendicular to tip cap)
        // Adjust the "pull" length of the tangent based on activeRadius
        const pull = Math.min(activeRadius * 0.4, length * 0.4);
        const p2 = { 
            x: p3.x - rx * pull, 
            y: p3.y - ry * pull 
        };

        // --- BASE CORNERS ---
        const pBaseLeft  = { x: p0.x - halfT, y: p0.y };
        const pBaseRight = { x: p0.x + halfT, y: p0.y };

        // --- SIDE CONTROL POINTS ---
        const s1_cp1 = { x: p1.x - halfT, y: p1.y };
        const s1_cp2 = { x: p2.x - tx * halfT, y: p2.y - ty * halfT };

        const s2_cp1 = { x: p1.x + halfT, y: p1.y };
        const s2_cp2 = { x: p2.x + tx * halfT, y: p2.y + ty * halfT };

        // --- DRAW ---
        graphics.beginPath();
        
        graphics.moveTo(pBaseLeft.x, pBaseLeft.y);
        graphics.lineTo(pBaseRight.x, pBaseRight.y);

        this.drawCubicBezier(graphics, pBaseRight, s2_cp1, s2_cp2, pTipRight, 24);
        graphics.lineTo(pTipLeft.x, pTipLeft.y);
        this.drawCubicBezier(graphics, pTipLeft, s1_cp2, s1_cp1, pBaseLeft, 24);

        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
}

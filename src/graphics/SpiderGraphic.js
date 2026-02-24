import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class SpiderGraphic extends BaseGraphic {
    constructor(scene, config) {
        super(scene, config);
        this.setupSpider(config);
    }

    create(config) {
        return this.scene.add.container(0, 0);
    }

    setupSpider(config) {
        const bodyColor = config.color || 0x000000;

        this.head = this.scene.add.ellipse(0, -8, 14, 16, bodyColor);
        this.abdomen = this.scene.add.ellipse(0, 12, 22, 28, bodyColor);
        this.gameObject.add(this.abdomen);
        this.gameObject.add(this.head);

        const segmentDefs = [
            { name: 'Coxa', len: 6, w: 3.5 },
            { name: 'Trochanter', len: 4, w: 3.0 },
            { name: 'Femur', len: 22, w: 2.5 },
            { name: 'Patella', len: 6, w: 2.5 },
            { name: 'Tibia', len: 20, w: 2.0 },
            { name: 'Metatarsus', len: 18, w: 1.5 },
            { name: 'Tarsus', len: 10, w: 1.0 }
        ];

        // 1. Fully Hardcoded Coordinates & Vectors
        // No dynamic flipping. What you see is exactly what renders.
        // In Phaser: 0 is Right, -90 is Up, 90 is Down, 180/-180 is Left.
        const legConfigs = [
            // --- LEFT SIDE (All X are -5) ---
            { id: 'L1', name: 'Red', color: 0xFF0000, x: -5, y: -12, angleDeg: -115 }, // Points Up-Left
            { id: 'L2', name: 'Green', color: 0x00FF00, x: -5, y: -8, angleDeg: -155 }, // Points Up-Left
            { id: 'L3', name: 'Blue', color: 0x0000FF, x: -5, y: -4, angleDeg: 155 }, // Points Down-Left
            { id: 'L4', name: 'Yellow', color: 0xFFFF00, x: -5, y: 0, angleDeg: 105 }, // Points Down-Left

            // --- RIGHT SIDE (All X are 5) ---
            { id: 'R1', name: 'Pink', color: 0xFF00FF, x: 5, y: -12, angleDeg: -65 }, // Points Up-Right
            { id: 'R2', name: 'Cyan', color: 0x00FFFF, x: 5, y: -8, angleDeg: -25 }, // Points Up-Right
            { id: 'R3', name: 'Orange', color: 0xFFA500, x: 5, y: -4, angleDeg: 25 }, // Points Down-Right
            { id: 'R4', name: 'White', color: 0xFFFFFF, x: 5, y: 0, angleDeg: 75 }  // Points Down-Right
        ];

        this.legs = legConfigs.map((cfg) => {
            let curX = cfg.x;
            let curY = cfg.y;

            // Convert exact vector angle to radians
            const angleRad = Phaser.Math.DegToRad(cfg.angleDeg);

            const legParts = [];
            segmentDefs.forEach((def) => {
                const displayLen = def.len;

                const seg = this.scene.add.rectangle(curX, curY, def.w, displayLen, cfg.color);
                seg.setOrigin(0.5, 0);
                seg.setStrokeStyle(1, 0x000000);

                // Phaser rectangles point DOWN (90deg) by default. 
                // Subtracting 90 aligns them perfectly with our mathematical vector.
                seg.setRotation(angleRad - Math.PI / 2);

                this.gameObject.add(seg);
                legParts.push(seg);

                // Pure tip-to-tail vector addition. No guessing.
                curX += Math.cos(angleRad) * displayLen;
                curY += Math.sin(angleRad) * displayLen;
            });

            // Tip Marker
            const tipMarker = this.scene.add.circle(curX, curY, 4, cfg.color);
            tipMarker.setStrokeStyle(1, 0x000000);
            this.gameObject.add(tipMarker);

            return { id: cfg.id, parts: legParts, tip: tipMarker };
        });
    }
}
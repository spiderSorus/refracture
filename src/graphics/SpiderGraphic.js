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

        // Root head container
        this.head = this.scene.add.container(0, -8);
        this.gameObject.add(this.head);

        // Head visual
        this.headVisual = this.scene.add.ellipse(0, 0, 14, 16, bodyColor);
        this.head.add(this.headVisual);

        // Abdomen parented to head
        this.abdomen = this.scene.add.ellipse(0, 20, 22, 28, bodyColor);
        this.head.add(this.abdomen);

        // Direction indicator triangle (Parented to head)
        this.directionTriangle = this.scene.add.triangle(7, -20, 0, -8, -6, 4, 6, 4, 0xffffff);
        this.directionTriangle.setStrokeStyle(1, 0x000000);
        this.head.add(this.directionTriangle);

        // Alignment Cross (Origin)
        const crossH = this.scene.add.rectangle(0, 0, 10, 1, 0xff0000);
        const crossV = this.scene.add.rectangle(0, 0, 1, 10, 0xff0000);
        this.gameObject.add(crossH);
        this.gameObject.add(crossV);

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
            // --- LEFT SIDE (Relative to head) ---
            { id: 'L1', name: 'Red', color: 0xFF0000, x: -5, y: -4, angleDeg: -115 },
            { id: 'L2', name: 'Green', color: 0x00FF00, x: -5, y: 0, angleDeg: -155 },
            { id: 'L3', name: 'Blue', color: 0x0000FF, x: -5, y: 4, angleDeg: 155 },
            { id: 'L4', name: 'Yellow', color: 0xFFFF00, x: -5, y: 8, angleDeg: 105 },

            // --- RIGHT SIDE (Relative to head) ---
            { id: 'R1', name: 'Pink', color: 0xFF00FF, x: 5, y: -4, angleDeg: -65 },
            { id: 'R2', name: 'Cyan', color: 0x00FFFF, x: 5, y: 0, angleDeg: -25 },
            { id: 'R3', name: 'Orange', color: 0xFFA500, x: 5, y: 4, angleDeg: 25 },
            { id: 'R4', name: 'White', color: 0xFFFFFF, x: 5, y: 8, angleDeg: 75 }
        ];

        this.legs = legConfigs.map((cfg) => {
            const angleRad = Phaser.Math.DegToRad(cfg.angleDeg);

            // Each leg starts with a root joint container parented to the head
            let currentJoint = this.scene.add.container(cfg.x, cfg.y);
            this.head.add(currentJoint);

            // Initial orientation of the entire leg
            currentJoint.setRotation(angleRad - Math.PI / 2);

            const legParts = [];
            const joints = [currentJoint];

            segmentDefs.forEach((def, index) => {
                // The visual segment (rectangle)
                const seg = this.scene.add.rectangle(0, 0, def.w, def.len, cfg.color);
                seg.setOrigin(0.5, 0);
                seg.setStrokeStyle(1, 0x000000);
                currentJoint.add(seg);
                legParts.push(seg);

                // If there's another segment, create a joint container for it at the end of this one
                if (index < segmentDefs.length - 1) {
                    const nextJoint = this.scene.add.container(0, def.len);
                    currentJoint.add(nextJoint);
                    currentJoint = nextJoint;
                    joints.push(currentJoint);
                }
            });

            // Tip Marker at the end of the final segment
            const tipMarker = this.scene.add.circle(0, segmentDefs[segmentDefs.length - 1].len, 4, cfg.color);
            tipMarker.setStrokeStyle(1, 0x000000);
            currentJoint.add(tipMarker);

            return { id: cfg.id, parts: legParts, joints: joints, tip: tipMarker };
        });
    }
}
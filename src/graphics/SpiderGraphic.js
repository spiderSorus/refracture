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
        this.head = this.scene.add.container(0, -2);
        this.gameObject.add(this.head);

        // Head visual
        this.headVisual = this.scene.add.ellipse(0, 0, 4, 5, bodyColor);
        this.head.add(this.headVisual);

        // Abdomen parented to head
        this.abdomen = this.scene.add.ellipse(0, 5, 6, 8, bodyColor);
        this.head.add(this.abdomen);

        // Direction indicator triangle (Parented to head)
        this.directionTriangle = this.scene.add.triangle(3.5, -4.5, 0, -2, -1.5, 1, 1.5, 1, 0xffffff);
        this.directionTriangle.setStrokeStyle(0.5, 0x000000);
        this.head.add(this.directionTriangle);

        // Alignment Cross (Origin)
        const crossH = this.scene.add.rectangle(0, 0, 4, 0.4, 0xff0000);
        const crossV = this.scene.add.rectangle(0, 0, 0.4, 4, 0xff0000);
        this.gameObject.add(crossH);
        this.gameObject.add(crossV);

        const segmentDefs = [
            { name: 'Coxa', len: 0.8, w: 0.9 },
            { name: 'Trochanter', len: 0.6, w: 0.8 },
            { name: 'Femur', len: 2.8, w: 0.7 },
            { name: 'Patella', len: 0.8, w: 0.7 },
            { name: 'Tibia', len: 2.5, w: 0.5 },
            { name: 'Metatarsus', len: 2.2, w: 0.4 },
            { name: 'Tarsus', len: 1.2, w: 0.3 }
        ];

        // 1. Fully Hardcoded Coordinates & Vectors
        // No dynamic flipping. What you see is exactly what renders.
        // In Phaser: 0 is Right, -90 is Up, 90 is Down, 180/-180 is Left.
        const legConfigs = [
            // --- LEFT SIDE (Relative to head) ---
            { id: 'L1', name: 'Red', color: 0xFF0000, x: -1.5, y: -1, angleDeg: -115 },
            { id: 'L2', name: 'Green', color: 0x00FF00, x: -1.5, y: -0.2, angleDeg: -155 },
            { id: 'L3', name: 'Blue', color: 0x0000FF, x: -1.5, y: 0.6, angleDeg: 155 },
            { id: 'L4', name: 'Yellow', color: 0xFFFF00, x: -1.5, y: 1.4, angleDeg: 105 },

            // --- RIGHT SIDE (Relative to head) ---
            { id: 'R1', name: 'Pink', color: 0xFF00FF, x: 1.5, y: -1, angleDeg: -65 },
            { id: 'R2', name: 'Cyan', color: 0x00FFFF, x: 1.5, y: -0.2, angleDeg: -25 },
            { id: 'R3', name: 'Orange', color: 0xFFA500, x: 1.5, y: 0.6, angleDeg: 25 },
            { id: 'R4', name: 'White', color: 0xFFFFFF, x: 1.5, y: 1.4, angleDeg: 75 }
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
                seg.setStrokeStyle(0.2, 0x000000);
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
            const tipMarker = this.scene.add.circle(0, segmentDefs[segmentDefs.length - 1].len, 0.8, cfg.color);
            tipMarker.setStrokeStyle(0.2, 0x000000);
            currentJoint.add(tipMarker);

            return { id: cfg.id, parts: legParts, joints: joints, tip: tipMarker };
        });
    }
}
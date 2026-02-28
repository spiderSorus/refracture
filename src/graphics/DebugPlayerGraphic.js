import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class DebugPlayerGraphic extends BaseGraphic {
    create(config) {
        const radius = config.radius || 16;
        const color = config.color || 0xffffff;
        
        const container = this.scene.add.container(0, 0);
        
        this.circle = this.scene.add.circle(0, 0, radius, color);
        container.add(this.circle);

        this.spokes = [];
        const spokeCount = 4;
        const spokeColor = config.spokeColor !== undefined ? config.spokeColor : 0x000000;
        
        for (let i = 0; i < spokeCount; i++) {
            const angle = (i / spokeCount) * Math.PI;
            const spoke = this.scene.add.rectangle(0, 0, radius * 2, 2, spokeColor, 0.5);
            spoke.setRotation(angle);
            container.add(spoke);
            this.spokes.push(spoke);
        }

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;

        const intensity = config.intensity ?? 1.0;
        const baseRadius = config.radius || 16;
        let currentRadius = baseRadius;

        if (intensity > 1.0) {
            const jitter = (intensity - 1.0) * 2;
            currentRadius = baseRadius + (Math.random() * jitter);
        } else {
            currentRadius = baseRadius * intensity;
        }

        this.circle.setRadius(currentRadius);
        this.spokes.forEach(spoke => {
            spoke.setSize(currentRadius * 2, 2);
        });
    }
}

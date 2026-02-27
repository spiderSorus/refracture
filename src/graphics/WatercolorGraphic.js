import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class WatercolorGraphic extends BaseGraphic {
    create(config) {
        const radius = config.radius || 32;
        const width = config.width || radius * 2;
        const height = config.height || radius * 2;
        const color = config.color || 0x3399ff;
        const layers = config.layers || 5;
        const shape = config.shape || 'circle';
        
        const container = this.scene.add.container(0, 0);
        this.blobs = [];

        for (let i = 0; i < layers; i++) {
            const jitterScale = (1 + (Math.random() * 0.4 - 0.2));
            const alpha = 0.4 + (Math.random() * 0.4); // Increased from 0.1-0.3
            let blob;

            if (shape === 'rect') {
                blob = this.scene.add.rectangle(
                    (Math.random() * 20 - 10),
                    (Math.random() * 20 - 10),
                    width * jitterScale,
                    height * jitterScale,
                    color,
                    alpha
                );
            } else if (shape === 'oval') {
                blob = this.scene.add.ellipse(
                    (Math.random() * 20 - 10),
                    (Math.random() * 20 - 10),
                    width * jitterScale,
                    height * jitterScale,
                    color,
                    alpha
                );
            } else {
                blob = this.scene.add.circle(
                    (Math.random() * 10 - 5),
                    (Math.random() * 10 - 5),
                    radius * jitterScale,
                    color,
                    alpha
                );
            }
            
            container.add(blob);
            this.blobs.push({
                obj: blob,
                baseW: width * jitterScale,
                baseH: height * jitterScale,
                baseR: radius * jitterScale,
                shape: shape,
                seed: Math.random() * 100,
                offsetX: blob.x,
                offsetY: blob.y
            });
        }

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;
        const time = this.scene.time.now * 0.001;

        this.blobs.forEach(blob => {
            const wobble = Math.sin(time + blob.seed) * 2;
            
            if (blob.shape === 'rect' || blob.shape === 'oval') {
                blob.obj.setSize(blob.baseW + wobble, blob.baseH + wobble);
            } else {
                blob.obj.setRadius(blob.baseR + wobble);
            }

            blob.obj.x = blob.offsetX + Math.cos(time * 0.5 + blob.seed) * 3;
            blob.obj.y = blob.offsetY + Math.sin(time * 0.5 + blob.seed) * 3;
        });
    }
}

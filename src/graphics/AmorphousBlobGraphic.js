import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class AmorphousBlobGraphic extends BaseGraphic {
    create(config) {
        const radius = config.radius || 50;
        const color = config.color || 0xffffff;
        const numBlobs = config.numBlobs || 7;
        
        const container = this.scene.add.container(0, 0);
        this.blobs = [];

        for (let i = 0; i < numBlobs; i++) {
            const angle = (i / numBlobs) * Math.PI * 2;
            const dist = Math.random() * radius * 0.4;
            const blobRadius = radius * (0.3 + Math.random() * 0.5);

            const blob = this.scene.add.ellipse(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist,
                blobRadius,
                blobRadius * (0.8 + Math.random() * 0.4),
                color,
                1.0
            );
            
            container.add(blob);
            this.blobs.push({
                obj: blob,
                baseX: blob.x,
                baseY: blob.y,
                baseW: blob.width,
                baseH: blob.height,
                seed: Math.random() * 100,
                speed: 0.1 + Math.random() * 0.2
            });
        }

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;
        const time = this.scene.time.now * 0.001;

        this.blobs.forEach(blob => {
            const timeOffset = time * blob.speed;
            const wobbleX = Math.sin(timeOffset + blob.seed) * 5;
            const wobbleY = Math.cos(timeOffset + blob.seed * 2) * 5;
            
            blob.obj.width = blob.baseW + Math.sin(timeOffset * 0.5) * 8;
            blob.obj.height = blob.baseH + Math.cos(timeOffset * 0.5) * 8;
            blob.obj.x = blob.baseX + wobbleX;
            blob.obj.y = blob.baseY + wobbleY;
        });
    }
}

import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class WatercolorTextGraphic extends BaseGraphic {
    create(config) {
        const text = config.text || '';
        const style = config.style || { fontSize: '24px', fontFamily: 'monospace' };
        const color = config.color !== undefined ? config.color : 0xffffff;
        const layers = config.layers || 4;
        
        const container = this.scene.add.container(0, 0);
        this.blobs = [];

        for (let i = 0; i < layers; i++) {
            const jitterScale = (1 + (Math.random() * 0.2 - 0.1));
            const alpha = 0.2 + (Math.random() * 0.3);
            
            const txt = this.scene.add.text(
                (Math.random() * 10 - 5),
                (Math.random() * 10 - 5),
                text,
                { ...style, fill: Phaser.Display.Color.IntegerToColor(color).rgba }
            );
            txt.setAlpha(alpha);
            txt.setScale(jitterScale);
            
            container.add(txt);
            this.blobs.push({
                obj: txt,
                seed: Math.random() * 100,
                offsetX: txt.x,
                offsetY: txt.y,
                baseScale: jitterScale
            });
        }

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;

        this.blobs.forEach(blob => {
            // Sync content if it changed (important for menu selection)
            if (config.text !== undefined && blob.obj.text !== config.text) {
                blob.obj.setText(config.text);
            }
            if (config.style?.fontSize && blob.obj.fontSize !== config.style.fontSize) {
                blob.obj.setFontSize(config.style.fontSize);
            }
        });
    }
}

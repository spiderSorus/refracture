import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class GlowGraphic extends BaseGraphic {
    create(config) {
        const container = this.scene.add.container(0, 0);
        const radius = config.radius || 25;
        const color = config.color || 0xffff00;

        // 1. Solid Core
        this.core = this.scene.add.circle(0, 0, radius * 0.5, color, 1.0);
        container.add(this.core);

        // 2. Outer Glow
        this.glow = this.scene.add.circle(0, 0, radius, color, 0.4);
        this.glow.setBlendMode(Phaser.BlendModes.ADD);
        container.add(this.glow);

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;
        
        // Pulse animation logic specific to this graphic type
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.2;
        this.glow.setScale(pulse);
        this.core.setScale(0.8 + Math.sin(Date.now() / 150) * 0.1);
    }
}
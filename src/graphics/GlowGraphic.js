import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class GlowGraphic extends BaseGraphic {
    create(config) {
        const g = this.scene.add.circle(
            0, 0,
            config.radius || 25,
            config.color || 0xffff00,
            0.3
        );

        g.setBlendMode(Phaser.BlendModes.ADD);
        return g;
    }

    onUpdate(config) {
        // Pulse animation logic specific to this graphic type
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.2;
        this.gameObject.setScale(pulse);
    }
}
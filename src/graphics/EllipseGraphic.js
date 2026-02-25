import { BaseGraphic } from './BaseGraphic';

export class EllipseGraphic extends BaseGraphic {
    create(config) {
        const container = this.scene.add.container(0, 0);

        this.ellipse = this.scene.add.ellipse(
            0, 0,
            config.width || 32,
            config.height || 32,
            config.color || 0xffffff,
            config.alpha ?? 1.0
        );
        
        container.add(this.ellipse);

        return container;
    }

    onUpdate(config) {
        if (!this.gameObject) return;

        const width = config.width || 32;
        const height = config.height || 32;
        const color = config.color || 0xffffff;
        const alpha = config.alpha ?? this.ellipse.alpha;

        this.ellipse.setSize(width, height);
        this.ellipse.setFillStyle(color, alpha);
    }
}

import { Position, Renderable, Rotation, EntityType, ZLayer, Parallax, BackgroundTag } from '../ecs/components/index';
import Phaser from 'phaser';

export const Complexity2Background = (scene, config = {}) => {
    const worldW = config.worldWidth || config.worldSize || 8000;
    const worldH = config.worldHeight || config.worldSize || 8000;

    const count = config.count || 1000;

    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(-worldW / 2, worldW / 2);
        const y = Phaser.Math.Between(-worldH / 2, worldH / 2);

        const width = Phaser.Math.Between(1, 50);
        const height = Phaser.Math.Between(500, 3000);
        const color = Math.random() > 0.5 ? 0x000000 : 0xffffff;

        // Randomly choose between watercolor and glass layers
        const layerName = Math.random() > 0.5 ? 'bg_watercolor' : 'bg_glass';
        const parallax = layerName === 'bg_watercolor' ? 0.2 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4;

        scene.addEntity([
            Position(x, y),
            Rotation(0),
            BackgroundTag(),
            EntityType('HARD_SHAPE_BG'),
            Parallax(parallax),
            ZLayer('BACK', Phaser.Math.Between(0, 50), layerName),
            Renderable({
                'BASE': {
                    type: 'hard_shape',
                    shape: 'rect',
                    width: width,
                    height: height,
                    color: color,
                    alpha: 1.0
                }
            })
        ]);
    }

    console.log(`[BACKGROUND] Complexity 2 Loaded with ${count} hard shapes.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 0.8
    };
};

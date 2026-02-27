import {
    Position, Velocity, Rotation, Renderable, Collider,
    PlatformTag, EntityType, Mass, ZLayer, Parallax, BackgroundTag,
    GravityExempt
} from '../ecs/components/index';
import Phaser from 'phaser';

/**
 * GreyBox Background
 * Generates a grid of floating rectangles that fill the world dimensions.
 */
export const GreyBoxBackground = (scene, config = {}) => {
    const worldW = config.worldWidth || 3000;
    const worldH = config.worldHeight || 10000;

    const minX = config.minX ?? 0;
    const minY = config.minY ?? -worldH;

    const layers = [
        { parallax: 0.1, color: 0x333333, cols: 8, rows: 20, layerName: 'bg_far' },
        { parallax: 0.2, color: 0x444444, cols: 10, rows: 25, layerName: 'bg_mid' },
        { parallax: 0.4, color: 0x555555, cols: 12, rows: 30, layerName: 'bg_near' }
    ];

    layers.forEach(l => {
        const cellW = worldW / l.cols;
        const cellH = worldH / l.rows;

        for (let r = 0; r < l.rows; r++) {
            for (let c = 0; c < l.cols; c++) {
                // Center of the grid cell
                const x = minX + (c + 0.5) * cellW;
                const y = minY + (r + 0.5) * cellH;

                // Random size: 30% to 80% of the cell dimensions
                const w = cellW * (0.3 + Math.random() * 0.5);
                const h = cellH * (0.3 + Math.random() * 0.5);

                // Very small random velocity for calm idle floating
                const vx = (Math.random() - 0.5) * 4;
                const vy = (Math.random() - 0.5) * 4;

                scene.addEntity([
                    Position(x, y),
                    Velocity(vx, vy),
                    Rotation(0),
                    GravityExempt(),
                    BackgroundTag(),
                    PlatformTag(),
                    EntityType('GREY_BOX'),
                    Mass((w * h) / 1000),
                    Parallax(l.parallax),
                    ZLayer('BACKGROUND', 0, l.layerName),
                    Renderable({
                        'BASE': {
                            type: 'rect',
                            width: w,
                            height: h,
                            color: l.color,
                            alpha: 1.0,
                            strokeColor: 0x888888,
                            strokeWidth: 1
                        }
                    }),
                    Collider('rect', w / 2, w, h)
                ]);
            }
        }
    });

    console.log(`[BACKGROUND] GreyBox Grid Loaded.`);

    return {
        backgroundColor: 0xcccccc, // Light Grey
        enableAtmosphere: false
    };
};

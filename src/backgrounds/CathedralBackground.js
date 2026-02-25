import { createCathedralColumn } from '../ecs/entities/cathedral';
import Phaser from 'phaser';

/**
 * Cathedral Background
 * Generates a dense field of watercolor pillars with parallax.
 */
export const CathedralBackground = (scene, config = {}) => {
    const worldW = config.worldWidth || config.worldSize || 8000;
    const worldH = config.worldHeight || config.worldSize || 8000;
    
    // Scale count based on height (baseline 8000), capped at 10x for performance
    const hScale = Math.min(10, worldH / 8000);

    const layers = [
        { parallax: 0.1, zIndex: 40, count: 80 * hScale,  w: [20, 50], h: [400, 1000], alpha: 0.1, color: [20, 50] }, 
        { parallax: 0.3, zIndex: 30, count: 100 * hScale, w: [30, 60], h: [300, 800],  alpha: 0.2, color: [40, 80] }, 
        { parallax: 0.5, zIndex: 20, count: 120 * hScale, w: [40, 80], h: [200, 600],  alpha: 0.4, color: [60, 120] }, 
        { parallax: 0.7, zIndex: 10, count: 100 * hScale, w: [50, 100],h: [150, 500],  alpha: 0.6, color: [100, 180] }, 
        { parallax: 1.0, zIndex: 0,  count: 20 * hScale,  w: [100, 200],h: [800, 2000], alpha: 0.3, color: [150, 200] }  
    ];

    layers.forEach(l => {
        for (let i = 0; i < l.count; i++) {
            const x = Phaser.Math.Between(-worldW / 2, worldW / 2);
            const y = Phaser.Math.Between(-worldH / 2, worldH / 2);
            
            const r = Phaser.Math.Between(l.color[0], l.color[1]);
            const color = Phaser.Display.Color.GetColor(r, 5, 5);

            scene.addEntity(createCathedralColumn(x, y, {
                width: Phaser.Math.Between(l.w[0], l.w[1]),
                height: Phaser.Math.Between(l.h[0], l.h[1]),
                color: color,
                alpha: l.alpha,
                parallax: l.parallax,
                zType: 'BACK',
                zIndex: l.zIndex
            }));
        }
    });

    console.log(`[BACKGROUND] Loaded Cathedral with ${layers.reduce((acc, l) => acc + l.count, 0)} columns.`);
};

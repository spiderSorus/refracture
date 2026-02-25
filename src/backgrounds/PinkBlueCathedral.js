import { createCathedralColumn } from '../ecs/entities/cathedral';
import Phaser from 'phaser';

/**
 * Pink and Blue Cathedral Background
 * Uses powder blue and pink watercolor pillars.
 */
export const PinkBlueCathedral = (scene, config = {}) => {
    const worldSize = config.worldSize || 8000;
    
    const layers = [
        { parallax: 0.1, zIndex: 40, count: 800,  w: [20, 50], h: [400, 1000], alpha: 0.1 }, 
        { parallax: 0.3, zIndex: 30, count: 1000, w: [30, 60], h: [300, 800],  alpha: 0.2 }, 
        { parallax: 0.5, zIndex: 20, count: 1200, w: [40, 80], h: [200, 600],  alpha: 0.4 }, 
        { parallax: 0.7, zIndex: 10, count: 1000, w: [50, 100],h: [150, 500],  alpha: 0.6 }, 
        { parallax: 1.0, zIndex: 0,  count: 200,  w: [100, 200],h: [800, 2000], alpha: 0.3 }  
    ];

    const colors = [
        0xb0e0e6, // Powder Blue
        0xffc0cb, // Pink
        0xffb6c1, // Light Pink
        0xadd8e6  // Light Blue
    ];

    layers.forEach(l => {
        for (let i = 0; i < l.count; i++) {
            const x = Phaser.Math.Between(-worldSize / 2, worldSize / 2);
            const y = Phaser.Math.Between(-worldSize / 2, worldSize / 2);
            
            const color = Phaser.Utils.Array.GetRandom(colors);

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

    console.log(`[BACKGROUND] Loaded Pink & Blue Cathedral.`);
};

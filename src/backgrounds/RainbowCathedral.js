import { createCathedralColumn } from '../ecs/entities/cathedral';
import Phaser from 'phaser';

/**
 * Rainbow Cathedral Background
 * Generates a dense field of watercolor pillars with a horizontal rainbow gradient.
 */
export const RainbowCathedral = (scene, config = {}) => {
    const worldW = config.worldWidth || config.worldSize || 8000;
    const worldH = config.worldHeight || config.worldSize || 8000;
    
    // Scale count based on height
    const hScale = Math.min(10, worldH / 8000);

    const layers = [
        { parallax: 0.1, zIndex: 40, count: 80 * hScale,  w: [20, 50], h: [400, 1000], alpha: 0.1 }, 
        { parallax: 0.3, zIndex: 30, count: 100 * hScale, w: [30, 60], h: [300, 800],  alpha: 0.2 }, 
        { parallax: 0.5, zIndex: 20, count: 120 * hScale, w: [40, 80], h: [200, 600],  alpha: 0.4 }, 
        { parallax: 0.7, zIndex: 10, count: 100 * hScale, w: [50, 100],h: [150, 500],  alpha: 0.6 }, 
        { parallax: 1.0, zIndex: 0,  count: 20 * hScale,  w: [100, 200],h: [800, 2000], alpha: 0.3 }  
    ];

    const rainbowColors = [
        0xff0000, // Red
        0xffa500, // Orange
        0xffff00, // Yellow
        0x008000, // Green
        0x0000ff, // Blue
        0x800080  // Purple
    ];

    layers.forEach(l => {
        for (let i = 0; i < l.count; i++) {
            const x = Phaser.Math.Between(-worldW / 2, worldW / 2);
            const y = Phaser.Math.Between(-worldH / 2, worldH / 2);
            
            // Normalize x to 0-1 range based on worldW
            const t = (x + worldW / 2) / worldW;
            // Map t to rainbow colors
            const colorIndex = Math.min(rainbowColors.length - 1, Math.floor(t * rainbowColors.length));
            const baseColor = rainbowColors[colorIndex];

            scene.addEntity(createCathedralColumn(x, y, {
                width: Phaser.Math.Between(l.w[0], l.w[1]),
                height: Phaser.Math.Between(l.h[0], l.h[1]),
                color: baseColor,
                alpha: l.alpha,
                parallax: l.parallax,
                zType: 'BACKGROUND',
                zIndex: l.zIndex,
                layerName: config.layerName
            }));
        }
    });

    console.log(`[BACKGROUND] Loaded Rainbow Cathedral with ${layers.reduce((acc, l) => acc + l.count, 0)} columns.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: false
    };
};

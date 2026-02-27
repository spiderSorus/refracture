import { generateBackgroundRectangles } from './BackgroundGenerator';
import Phaser from 'phaser';

/**
 * Cathedral Background
 * Generates a dense field of watercolor pillars with parallax.
 */
export const CathedralBackground = (scene, config = {}) => {
    const worldH = config.worldHeight || config.worldSize || 8000;
    
    // Scale count based on height (baseline 8000), capped at 10x for performance
    const hScale = Math.min(10, worldH / 8000);

    const layers = [
        { parallax: 0.1, zIndex: 40, count: 120 * hScale, w: [20, 50], h: [400, 1000], alpha: 0.2, color: [20, 50] }, 
        { parallax: 0.3, zIndex: 30, count: 150 * hScale, w: [30, 60], h: [300, 800],  alpha: 0.3, color: [40, 80] }, 
        { parallax: 0.5, zIndex: 20, count: 180 * hScale, w: [40, 80], h: [200, 600],  alpha: 0.5, color: [60, 120] }, 
        { parallax: 0.7, zIndex: 10, count: 150 * hScale, w: [50, 100],h: [150, 500],  alpha: 0.7, color: [100, 180] }, 
        { parallax: 1.0, zIndex: 0,  count: 40 * hScale,  w: [100, 200],h: [800, 2000], alpha: 0.4, color: [150, 200] }  
    ];

    layers.forEach(l => {
        generateBackgroundRectangles(scene, config, {
            count: l.count,
            parallax: l.parallax,
            zIndex: l.zIndex,
            layerName: config.layerName || 'bg_watercolor',
            widthRange: l.w,
            heightRange: l.h,
            alpha: l.alpha,
            color: () => {
                const r = Phaser.Math.Between(l.color[0], l.color[1]);
                return Phaser.Display.Color.GetColor(r, 5, 5);
            },
            renderType: 'watercolor'
        });
    });

    console.log(`[BACKGROUND] Loaded Cathedral.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: false,
        cameraConfigs: [
            { name: 'BackgroundWC', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACKGROUND', includeUI: true },
            { name: 'BackgroundOldGlass', layer: 'bg_glass', effect: 'old_glass', type: 'BACKGROUND', includeUI: true }
        ]
    };
};

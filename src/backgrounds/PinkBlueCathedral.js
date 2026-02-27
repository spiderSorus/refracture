import { generateBackgroundRectangles } from './BackgroundGenerator';
import Phaser from 'phaser';

/**
 * Pink and Blue Cathedral Background
 * Uses powder blue and pink watercolor pillars.
 */
export const PinkBlueCathedral = (scene, config = {}) => {
    const layers = [
        { parallax: 0.1, zIndex: 40, count: 800,  w: [20, 50], h: [400, 1000], alpha: 0.2 }, 
        { parallax: 0.3, zIndex: 30, count: 1000, w: [30, 60], h: [300, 800],  alpha: 0.3 }, 
        { parallax: 0.5, zIndex: 20, count: 1200, w: [40, 80], h: [200, 600],  alpha: 0.5 }, 
        { parallax: 0.7, zIndex: 10, count: 1000, w: [50, 100],h: [150, 500],  alpha: 0.6 }, 
        { parallax: 1.0, zIndex: 0,  count: 200,  w: [100, 200],h: [800, 2000], alpha: 0.4 }  
    ];

    const colors = [
        0xb0e0e6, // Powder Blue
        0xffc0cb, // Pink
        0xffb6c1, // Light Pink
        0xadd8e6  // Light Blue
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
            color: () => Phaser.Utils.Array.GetRandom(colors),
            renderType: 'watercolor'
        });
    });

    console.log(`[BACKGROUND] Loaded Pink & Blue Cathedral.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: false,
        cameraConfigs: [
            { name: 'BackgroundWC', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACKGROUND', includeUI: true },
            { name: 'BackgroundOldGlass', layer: 'bg_glass', effect: 'old_glass', type: 'BACKGROUND', includeUI: true }
        ]
    };
};

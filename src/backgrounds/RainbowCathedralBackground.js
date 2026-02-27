import { generateRainbowCathedralColumns, generateBackgroundRectangles } from './BackgroundGenerator';
import Phaser from 'phaser';

/**
 * Rainbow Cathedral Background
 * 5 layers of deep rainbow watercolor columns with a white atmosphere.
 */
export const RainbowCathedralBackground = (scene, config = {}) => {
    const worldW = config.worldWidth || 5000;
    const worldH = config.worldHeight || 5000;
    const areaScale = (worldW * worldH) / (5000 * 5000);

    const layers = [
        { parallax: 0.1, zIndex: 50, count: 200, alpha: 0.2 },
        { parallax: 0.3, zIndex: 40, count: 250, alpha: 0.2 },
        { parallax: 0.5, zIndex: 30, count: 300, alpha: 0.2 },
        { parallax: 0.7, zIndex: 20, count: 250, alpha: 0.2 },
        { parallax: 0.9, zIndex: 10, count: 100, alpha: 0.2 }
    ];

    layers.forEach(l => {
        const totalCount = Math.min(3000, Math.round(l.count * areaScale));
        
        generateRainbowCathedralColumns(scene, config, {
            count: totalCount,
            parallax: l.parallax,
            zIndex: l.zIndex,
            layerName: 'bg_watercolor',
            alpha: l.alpha
        });

        // Restore Atmosphere Plane (Black fog)
        generateBackgroundRectangles(scene, config, {
            count: Math.max(2, Math.round(5 * areaScale)),
            parallax: l.parallax + 0.1,
            zIndex: l.zIndex + 1,
            layerName: 'bg_watercolor',
            widthRange: [worldW * 0.8, worldW * 2.0],
            heightRange: [worldH * 0.2, worldH * 0.5],
            color: 0x000000,
            alpha: 0.3,
            renderType: 'watercolor'
        });
    });

    console.log(`[BACKGROUND] Rainbow Cathedral Loaded.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 0.9,
        cameras: ['stainedGlass']
    };
};

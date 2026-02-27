import { generateCathedralColumns, generateBackgroundRectangles } from './BackgroundGenerator';
import Phaser from 'phaser';

/**
 * Red Cathedral Background
 * 5 layers of deep red watercolor columns with very deep parallax.
 */
export const RedCathedralBackground = (scene, config = {}) => {
    const worldW = config.worldWidth || 5000;
    const worldH = config.worldHeight || 5000;
    const areaScale = (worldW * worldH) / (5000 * 5000);

    // 5 Deep parallax layers: 0.1 (far) to 0.9 (near)
    const layers = [
        { parallax: 0.1, zIndex: 50, count: 40, color: [100, 150], alpha: 0.2 },
        { parallax: 0.3, zIndex: 40, count: 50, color: [150, 200], alpha: 0.3 },
        { parallax: 0.5, zIndex: 30, count: 60, color: [200, 255], alpha: 0.5 },
        { parallax: 0.7, zIndex: 20, count: 50, color: [150, 200], alpha: 0.7 },
        { parallax: 0.9, zIndex: 10, count: 20, color: [100, 150], alpha: 0.4 }
    ];

    layers.forEach(l => {
        // Limit total count even in massive scenes to avoid performance issues
        const totalCount = Math.min(1000, Math.round(l.count * areaScale));
        
        generateCathedralColumns(scene, config, {
            count: totalCount,
            parallax: l.parallax,
            zIndex: l.zIndex,
            layerName: 'bg_watercolor',
            alpha: l.alpha,
            color: () => {
                const r = Phaser.Math.Between(l.color[0], l.color[1]);
                return Phaser.Display.Color.GetColor(r, 0, 0); // Pure Red spectrum
            }
        });

        // Add an "Atmosphere Plane" for each layer to create haze between depths
        // This is a few very large, very faint horizontal watercolor blocks
        generateBackgroundRectangles(scene, config, {
            count: Math.max(2, Math.round(5 * areaScale)),
            parallax: l.parallax + 0.1, // Offset further from columns
            zIndex: l.zIndex + 1, // Just behind the columns of this layer
            layerName: 'bg_watercolor',
            widthRange: [worldW * 0.8, worldW * 2.0],
            heightRange: [worldH * 0.2, worldH * 0.5],
            color: 0x000000, // Black fog
            alpha: 0.3, // Higher alpha for more "haze"
            renderType: 'watercolor'
        });
    });

    console.log(`[BACKGROUND] Red Cathedral Loaded.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 0.9,
        cameras: ['stainedGlass']
    };
};

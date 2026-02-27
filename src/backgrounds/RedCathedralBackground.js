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
        { parallax: 0.1, zIndex: 50, count: 200, color: [100, 150], alpha: 0.2 },
        { parallax: 0.3, zIndex: 40, count: 250, color: [150, 200], alpha: 0.2 },
        { parallax: 0.5, zIndex: 30, count: 300, color: [200, 255], alpha: 0.2 },
        { parallax: 0.7, zIndex: 20, count: 250, color: [150, 200], alpha: 0.2 },
        { parallax: 0.9, zIndex: 10, count: 100, color: [100, 150], alpha: 0.2 }
    ];

    layers.forEach(l => {
        // Lower cap to prevent massive over-generation
        const totalCount = Math.min(3000, Math.round(l.count * areaScale));
        
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
            count: Math.max(4, Math.round(8 * areaScale)), // Denser fog
            parallax: l.parallax + 0.1, 
            zIndex: l.zIndex + 1, 
            layerName: 'bg_watercolor',
            widthRange: [worldW * 1.0, worldW * 2.5],
            heightRange: [worldH * 0.3, worldH * 0.6],
            color: 0x000000, // Black fog
            alpha: 0.5, // Much thicker fog
            renderType: 'watercolor'
        });
    });

    console.log(`[BACKGROUND] Red Cathedral Loaded.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 1.0, // Max atmosphere
        cameras: ['stainedGlass']
    };
};

import { generateBackgroundRectangles } from './BackgroundGenerator';

/**
 * Watercolor Background
 * A clean, high-performance rework using dual-layered watercolor rectangles.
 */
export const WatercolorBackground = (scene, config = {}) => {
    const worldW = config.worldWidth || 5000;
    const worldH = config.worldHeight || 5000;

    // Density-based scaling: baseline is 5000x5000 area
    const areaScale = (worldW * worldH) / (5000 * 5000);
    
    // Lowered counts for a sparser look
    const countFar = Math.min(3000, Math.max(200, Math.round(200 * areaScale)));
    const countNear = Math.min(2000, Math.max(150, Math.round(150 * areaScale)));

    // 1. Far Horizontal Layer (Deep Blue / Parallax 0.1)
    generateBackgroundRectangles(scene, config, {
        count: Math.min(500, Math.max(50, Math.round(50 * areaScale))),
        parallax: 0.1,
        zIndex: 60, 
        layerName: 'bg_watercolor',
        widthRange: [2000, 6000], // Long horizontal beams
        heightRange: [100, 300],
        color: 0x112244,
        alpha: 0.15,
        renderType: 'watercolor'
    });

    // 2. Far Vertical Columns (Deep Purple / Parallax 0.2)
    generateBackgroundRectangles(scene, config, {
        count: countFar,
        parallax: 0.2,
        zIndex: 50, 
        layerName: 'bg_watercolor',
        widthRange: [200, 600],
        heightRange: [3000, 10000],
        color: 0x442266,
        alpha: 0.2,
        renderType: 'watercolor'
    });

    // 3. Near Vertical Columns (Teal / Parallax 0.6)
    generateBackgroundRectangles(scene, config, {
        count: countNear,
        parallax: 0.6,
        zIndex: 20, 
        layerName: 'bg_watercolor',
        widthRange: [100, 400],
        heightRange: [1500, 5000],
        color: 0x2288aa, // Brighter teal
        alpha: 0.2,
        renderType: 'watercolor'
    });

    // 4. Near Horizontal Layer (Cyan / Parallax 0.8)
    generateBackgroundRectangles(scene, config, {
        count: Math.min(300, Math.max(40, Math.round(40 * areaScale))),
        parallax: 0.8,
        zIndex: 10, 
        layerName: 'bg_watercolor',
        widthRange: [1000, 3000],
        heightRange: [50, 150],
        color: 0x44aaee,
        alpha: 0.15,
        renderType: 'watercolor'
    });

    console.log(`[BACKGROUND] Watercolor Rework Loaded.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 0.7,
        cameras: ['watercolor']
    };
};

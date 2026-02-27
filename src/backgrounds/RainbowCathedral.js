import { generateBackgroundRectangles } from './BackgroundGenerator';

/**
 * Rainbow Cathedral Background
 * Generates a dense field of watercolor pillars with a horizontal rainbow gradient.
 */
export const RainbowCathedral = (scene, config = {}) => {
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
        generateBackgroundRectangles(scene, config, {
            count: l.count,
            parallax: l.parallax,
            zIndex: l.zIndex,
            layerName: config.layerName,
            widthRange: l.w,
            heightRange: l.h,
            alpha: l.alpha,
            color: (x, y, drawMinX, drawWidth) => {
                // Normalize x to 0-1 range based on worldW
                const t = (x - drawMinX) / drawWidth;
                // Map t to rainbow colors
                const colorIndex = Math.min(rainbowColors.length - 1, Math.floor(t * rainbowColors.length));
                return rainbowColors[colorIndex];
            },
            renderType: 'watercolor'
        });
    });

    console.log(`[BACKGROUND] Loaded Rainbow Cathedral.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: false
    };
};

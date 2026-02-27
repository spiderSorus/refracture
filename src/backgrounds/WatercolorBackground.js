import { generateBackgroundRectangles } from './BackgroundGenerator';

/**
 * Watercolor Background
 * A clean, high-performance rework using dual-layered watercolor rectangles.
 */
export const WatercolorBackground = (scene, config = {}) => {
    // 1. Far Layer (Deep Purples)
    generateBackgroundRectangles(scene, config, {
        count: 120,
        parallax: 0.2,
        zIndex: 10,
        layerName: 'bg_watercolor',
        widthRange: [100, 400],
        heightRange: [1000, 5000],
        color: 0x331144,
        alpha: 0.3,
        renderType: 'watercolor'
    });

    // 2. Near Layer (Teals/Blues)
    generateBackgroundRectangles(scene, config, {
        count: 80,
        parallax: 0.6,
        zIndex: 20,
        layerName: 'bg_glass',
        widthRange: [50, 200],
        heightRange: [500, 2500],
        color: 0x114466,
        alpha: 0.4,
        renderType: 'watercolor'
    });

    console.log(`[BACKGROUND] Watercolor Rework Loaded.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 0.7,
        cameraConfigs: [
            { name: 'BackgroundWC', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACKGROUND', includeUI: true },
            { name: 'BackgroundGlass', layer: 'bg_glass', effect: 'old_glass', type: 'BACKGROUND', includeUI: true }
        ]
    };
};

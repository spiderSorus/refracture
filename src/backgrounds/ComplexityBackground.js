import { generateBackgroundRectangles } from './BackgroundGenerator';

/**
 * Complexity Background
 * Combines two layers of cathedral columns with different camera effects.
 */
export const ComplexityBackground = (scene, config = {}) => {
    // 1. WATERCOLOR LAYER (Aura/Background)
    generateBackgroundRectangles(scene, config, {
        count: 150,
        parallax: 0.2,
        zIndex: 30,
        layerName: 'bg_watercolor',
        widthRange: [50, 150],
        heightRange: [1000, 3000],
        color: 0x442266, // Deep Purple
        alpha: 0.2,
        renderType: 'watercolor'
    });

    // 2. OLD GLASS LAYER (Crisp/Foreground of the background)
    generateBackgroundRectangles(scene, config, {
        count: 100,
        parallax: 0.5,
        zIndex: 10,
        layerName: 'bg_glass',
        widthRange: [30, 80],
        heightRange: [500, 1500],
        color: 0x2288aa, // Teal
        alpha: 0.4,
        renderType: 'watercolor' // Complexity used createCathedralColumn which is watercolor
    });

    console.log(`[BACKGROUND] Complexity Loaded.`);

    return {
        backgroundColor: 0xffffff,
        enableAtmosphere: true,
        atmosphereIntensity: 0.8,
        cameraConfigs: [
            { name: 'watercolor', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACKGROUND', includeUI: true },
            { name: 'old glass', layer: 'bg_glass', effect: 'old_glass', type: 'BACKGROUND' }
        ]
    };
};

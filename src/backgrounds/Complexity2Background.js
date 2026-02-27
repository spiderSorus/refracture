import { generateBackgroundRectangles } from './BackgroundGenerator';

export const Complexity2Background = (scene, config = {}) => {
    const count = config.count || 1000;

    // Split count between watercolor and glass
    const watercolorCount = Math.floor(count / 2);
    const glassCount = count - watercolorCount;

    // Fixed parallax factors for each layer so CameraSystem can pick them up consistently
    const wcParallax = 0.3;
    const glassParallax = 0.6;

    // Watercolor Layer
    generateBackgroundRectangles(scene, config, {
        count: watercolorCount,
        parallax: wcParallax,
        zIndex: 25,
        layerName: 'bg_watercolor',
        widthRange: [1, 50],
        heightRange: [500, 3000],
        color: () => Math.random() > 0.5 ? 0x000000 : 0xffffff,
        alpha: 0.8,
        renderType: 'hard_shape',
        entityType: 'HARD_SHAPE_BG'
    });

    // Glass Layer
    generateBackgroundRectangles(scene, config, {
        count: glassCount,
        parallax: glassParallax,
        zIndex: 25,
        layerName: 'bg_glass',
        widthRange: [1, 50],
        heightRange: [500, 3000],
        color: () => Math.random() > 0.5 ? 0x000000 : 0xffffff,
        alpha: 0.8,
        renderType: 'hard_shape',
        entityType: 'HARD_SHAPE_BG'
    });

    console.log(`[BACKGROUND] Complexity 2 Loaded.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 0.8,
        cameraConfigs: [
            { name: 'watercolor', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACKGROUND', includeUI: true },
            { name: 'old glass', layer: 'bg_glass', effect: 'old_glass', type: 'BACKGROUND' }
        ]
    };
};

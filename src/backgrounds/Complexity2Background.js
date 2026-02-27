import { generateBackgroundRectangles } from './BackgroundGenerator';

export const Complexity2Background = (scene, config = {}) => {
    const count = config.count || 1000;

    // Split count between watercolor and glass
    const watercolorCount = Math.floor(count / 2);
    const glassCount = count - watercolorCount;

    // Watercolor Layer
    generateBackgroundRectangles(scene, config, {
        count: watercolorCount,
        parallax: 0.2 + Math.random() * 0.3, // Approximation of original per-entity random
        zIndex: 25,
        layerName: 'bg_watercolor',
        widthRange: [1, 50],
        heightRange: [500, 3000],
        color: () => Math.random() > 0.5 ? 0x000000 : 0xffffff,
        alpha: 1.0,
        renderType: 'hard_shape',
        entityType: 'HARD_SHAPE_BG'
    });

    // Glass Layer
    generateBackgroundRectangles(scene, config, {
        count: glassCount,
        parallax: 0.5 + Math.random() * 0.4,
        zIndex: 25,
        layerName: 'bg_glass',
        widthRange: [1, 50],
        heightRange: [500, 3000],
        color: () => Math.random() > 0.5 ? 0x000000 : 0xffffff,
        alpha: 1.0,
        renderType: 'hard_shape',
        entityType: 'HARD_SHAPE_BG'
    });

    console.log(`[BACKGROUND] Complexity 2 Loaded.`);

    return {
        backgroundColor: 0x000000,
        enableAtmosphere: true,
        atmosphereIntensity: 0.8
    };
};

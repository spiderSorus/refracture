import { generateBackgroundRectangles } from './BackgroundGenerator';

/**
 * Complexity Background
 * Tests rendering multiple background cameras with different effects.
 * - Back: Grey circles (no effect)
 * - Front: Grey squares (watercolor effect)
 */
export const ComplexityBackground = (scene, config = {}) => {
    const worldW = config.worldWidth || 5000;
    const worldH = config.worldHeight || 5000;
    const areaScale = (worldW * worldH) / (5000 * 5000);

    // 1. Far Layer (Grey Circles / Parallax 0.2)
    generateBackgroundRectangles(scene, config, {
        count: Math.round(100 * areaScale),
        parallax: 0.2,
        zIndex: 50,
        layerName: 'bg_far',
        widthRange: [100, 300],
        heightRange: [100, 300],
        color: 0x888888,
        alpha: 0.4,
        renderType: 'hard_shape',
        shape: 'circle'
    });

    // 2. Near Layer (Grey Squares / Parallax 0.6)
    generateBackgroundRectangles(scene, config, {
        count: Math.round(80 * areaScale),
        parallax: 0.6,
        zIndex: 20,
        layerName: 'bg_near',
        widthRange: [150, 400],
        forceSquare: true,
        color: 0x666666,
        alpha: 0.5,
        renderType: 'watercolor'
    });

    console.log(`[BACKGROUND] Complexity Loaded.`);

    return {
        backgroundColor: 0x333333,
        enableAtmosphere: true,
        atmosphereIntensity: 0.5,
        cameraConfigs: [
            { name: 'Far Circles', layer: 'bg_far', effect: 'rainbow', type: 'BACKGROUND' },
            { name: 'Near Squares', layer: 'bg_near', effect: 'watercolor', type: 'BACKGROUND', includeUI: true }
        ]
    };
};

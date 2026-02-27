import { generateBackgroundRectangles } from './BackgroundGenerator';

/**
 * GreyBox Background
 * Generates a grid of floating rectangles that fill the world dimensions.
 */
export const GreyBoxBackground = (scene, config = {}) => {
    const layers = [
        { parallax: 0.1, color: 0x333333, cols: 8, rows: 20, layerName: 'bg_far' },
        { parallax: 0.2, color: 0x444444, cols: 10, rows: 25, layerName: 'bg_mid' },
        { parallax: 0.4, color: 0x555555, cols: 12, rows: 30, layerName: 'bg_near' }
    ];

    layers.forEach(l => {
        generateBackgroundRectangles(scene, config, {
            parallax: l.parallax,
            color: l.color,
            isGrid: true,
            cols: l.cols,
            rows: l.rows,
            layerName: l.layerName,
            widthRange: [0.3, 0.8], // Multipliers of cell size
            heightRange: [0.3, 0.8],
            renderType: 'rect',
            hasPhysics: true,
            alpha: 0.5,
            entityType: 'GREY_BOX'
        });
    });

    console.log(`[BACKGROUND] GreyBox Grid Loaded.`);

    return {
        backgroundColor: 0xcccccc, // Light Grey
        enableAtmosphere: false
    };
};

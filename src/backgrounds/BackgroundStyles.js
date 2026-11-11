// src/backgrounds/BackgroundStyles.js
import Phaser from 'phaser';
import {
    generateBackgroundRectangles,
    generateCathedralColumns,
    generateRainbowCathedralColumns,
    generateFogPlanes,
    generateGrid,
    generateInfiniteGrid
} from './BackgroundGenerator';

/**
 * Standard Background Styles
 * Declarative, easy-to-tune background presets.
 */

export const BACKGROUND_STYLES = {
    /**
     * Standard Watercolor: Dual-layer deep blue / purple columns and teal / cyan beams.
     */
    'watercolor': (scene, config = {}) => {
        const worldW = config.worldWidth || 5000;
        const worldH = config.worldHeight || 5000;
        const areaScale = (worldW * worldH) / (5000 * 5000);
        const density = config.density ?? 1.0;

        const countFar = Math.min(3000, Math.max(100, Math.round(200 * areaScale * density)));
        const countNear = Math.min(2000, Math.max(80, Math.round(150 * areaScale * density)));

        // 1. Far Horizontal Beams
        generateBackgroundRectangles(scene, config, {
            count: Math.min(500, Math.max(30, Math.round(50 * areaScale * density))),
            parallax: 0.1,
            zIndex: 60,
            layerName: 'bg_watercolor',
            widthRange: [worldW * 0.4, worldW * 1.2],
            heightRange: [100, 300],
            color: config.farBeamColor ?? 0x112244,
            alpha: 0.15,
            renderType: 'watercolor'
        });

        // 2. Far Vertical Columns
        generateBackgroundRectangles(scene, config, {
            count: countFar,
            parallax: 0.2,
            zIndex: 50,
            layerName: 'bg_watercolor',
            widthRange: [200, 600],
            heightRange: [worldH * 0.5, worldH * 1.5],
            color: config.farColumnColor ?? 0x442266,
            alpha: 0.2,
            renderType: 'watercolor'
        });

        // 3. Near Vertical Columns
        generateBackgroundRectangles(scene, config, {
            count: countNear,
            parallax: 0.6,
            zIndex: 20,
            layerName: 'bg_watercolor',
            widthRange: [100, 400],
            heightRange: [worldH * 0.3, worldH * 0.8],
            color: config.nearColumnColor ?? 0x2288aa,
            alpha: 0.2,
            renderType: 'watercolor'
        });

        // 4. Near Horizontal Beams
        generateBackgroundRectangles(scene, config, {
            count: Math.min(300, Math.max(25, Math.round(40 * areaScale * density))),
            parallax: 0.8,
            zIndex: 10,
            layerName: 'bg_watercolor',
            widthRange: [worldW * 0.2, worldW * 0.6],
            heightRange: [50, 150],
            color: config.nearBeamColor ?? 0x44aaee,
            alpha: 0.15,
            renderType: 'watercolor'
        });

        return {
            backgroundColor: config.backgroundColor ?? 0x000000,
            enableAtmosphere: config.enableAtmosphere ?? true,
            atmosphereIntensity: config.atmosphereIntensity ?? 0.7,
            cameras: ['watercolor']
        };
    },

    /**
     * Red Cathedral: Multi-layered crimson columns with atmospheric fog planes.
     */
    'red_cathedral': (scene, config = {}) => {
        const worldW = config.worldWidth || 5000;
        const worldH = config.worldHeight || 5000;
        const areaScale = (worldW * worldH) / (5000 * 5000);
        const density = config.density ?? 1.0;

        const layers = [
            { parallax: 0.1, zIndex: 50, count: 200, color: [100, 150], alpha: 0.2 },
            { parallax: 0.3, zIndex: 40, count: 250, color: [150, 200], alpha: 0.2 },
            { parallax: 0.5, zIndex: 30, count: 300, color: [200, 255], alpha: 0.2 },
            { parallax: 0.7, zIndex: 20, count: 250, color: [150, 200], alpha: 0.2 },
            { parallax: 0.9, zIndex: 10, count: 100, color: [100, 150], alpha: 0.2 }
        ];

        layers.forEach(l => {
            const totalCount = Math.min(2500, Math.round(l.count * areaScale * density));
            generateCathedralColumns(scene, config, {
                count: totalCount,
                parallax: l.parallax,
                zIndex: l.zIndex,
                layerName: 'bg_watercolor',
                alpha: l.alpha,
                color: () => {
                    const r = Phaser.Math.Between(l.color[0], l.color[1]);
                    return Phaser.Display.Color.GetColor(r, 0, 0);
                }
            });

            generateFogPlanes(scene, config, {
                count: Math.max(3, Math.round(6 * areaScale)),
                parallax: l.parallax + 0.1,
                zIndex: l.zIndex + 1,
                layerName: 'bg_watercolor',
                color: 0x000000,
                alpha: 0.4
            });
        });

        return {
            backgroundColor: config.backgroundColor ?? 0x000000,
            enableAtmosphere: config.enableAtmosphere ?? true,
            atmosphereIntensity: config.atmosphereIntensity ?? 1.0,
            cameras: ['stainedGlass']
        };
    },

    /**
     * Rainbow Cathedral: Multi-layered columns spanning the full color spectrum.
     */
    'rainbow_cathedral': (scene, config = {}) => {
        const worldW = config.worldWidth || 5000;
        const worldH = config.worldHeight || 5000;
        const areaScale = (worldW * worldH) / (5000 * 5000);
        const density = config.density ?? 1.0;

        const layers = [
            { parallax: 0.1, zIndex: 50, count: 180, alpha: 0.2 },
            { parallax: 0.3, zIndex: 40, count: 220, alpha: 0.2 },
            { parallax: 0.5, zIndex: 30, count: 260, alpha: 0.2 },
            { parallax: 0.7, zIndex: 20, count: 220, alpha: 0.2 },
            { parallax: 0.9, zIndex: 10, count: 90, alpha: 0.2 }
        ];

        layers.forEach(l => {
            const totalCount = Math.min(2500, Math.round(l.count * areaScale * density));
            generateRainbowCathedralColumns(scene, config, {
                count: totalCount,
                parallax: l.parallax,
                zIndex: l.zIndex,
                layerName: 'bg_watercolor',
                alpha: l.alpha
            });

            generateFogPlanes(scene, config, {
                count: Math.max(2, Math.round(5 * areaScale)),
                parallax: l.parallax + 0.1,
                zIndex: l.zIndex + 1,
                layerName: 'bg_watercolor',
                color: 0x000000,
                alpha: 0.3
            });
        });

        return {
            backgroundColor: config.backgroundColor ?? 0x000000,
            enableAtmosphere: config.enableAtmosphere ?? true,
            atmosphereIntensity: config.atmosphereIntensity ?? 0.9,
            cameras: ['stainedGlass']
        };
    },

    /**
     * Complexity: Multi-camera background demonstrating different shaders across layers.
     */
    'complexity': (scene, config = {}) => {
        const worldW = config.worldWidth || 5000;
        const worldH = config.worldHeight || 5000;
        const areaScale = (worldW * worldH) / (5000 * 5000);

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

        return {
            backgroundColor: config.backgroundColor ?? 0x333333,
            enableAtmosphere: config.enableAtmosphere ?? true,
            atmosphereIntensity: config.atmosphereIntensity ?? 0.5,
            cameraConfigs: [
                { name: 'Far Circles', layer: 'bg_far', effect: 'rainbow', type: 'BACKGROUND' },
                { name: 'Near Squares', layer: 'bg_near', effect: 'watercolor', type: 'BACKGROUND', includeUI: true }
            ]
        };
    },

    /**
     * Grid: Clean, high-performance tiling grid across world boundaries.
     */
    'grid': (scene, config = {}) => {
        generateGrid(scene, config);
        return {
            backgroundColor: config.backgroundColor ?? 0x050505,
            enableAtmosphere: false
        };
    },

    /**
     * Infinite Grid: Follows camera scroll factor for unbounded / infinite worlds.
     */
    'infinite_grid': (scene, config = {}) => {
        generateInfiniteGrid(scene, config);
        return {
            backgroundColor: config.backgroundColor ?? 0x050505,
            enableAtmosphere: false
        };
    },

    /**
     * Void: Pitch black or solid backdrop with no elements.
     */
    'void': (scene, config = {}) => {
        return {
            backgroundColor: config.backgroundColor ?? 0x050505,
            enableAtmosphere: false
        };
    }
};

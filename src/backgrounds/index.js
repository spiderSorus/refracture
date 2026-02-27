import { WatercolorBackground } from './WatercolorBackground';

const REGISTRY = {
    'watercolor': WatercolorBackground,
    'default': WatercolorBackground
};

/**
 * Global background loader.
 * @param {string} name - Key of the background in REGISTRY.
 * @param {Phaser.Scene} scene - The scene instance.
 * @param {Object} args - Custom arguments for the background script.
 */
export const loadBackground = (name, scene, args = {}) => {
    // Fallback to watercolor for any requested name since we've reworked to a single type
    const backgroundScript = REGISTRY[name] || WatercolorBackground;
    scene.currentBackground = REGISTRY[name] ? name : 'watercolor';

    const cam = scene.cameras.main;
    const bounds = cam.useBounds ? cam._bounds : { x: -2500, y: -2500, width: 5000, height: 5000 };

    const mergedArgs = {
        minX: bounds.x,
        minY: bounds.y,
        worldWidth: bounds.width,
        worldHeight: bounds.height,
        ...args
    };

    const config = backgroundScript(scene, mergedArgs) || {};
    
    // Store dimensions for debug UI
    if (mergedArgs.worldWidth || mergedArgs.worldHeight) {
        scene.bgDimensions = {
            w: Math.round(mergedArgs.worldWidth) || '?',
            h: Math.round(mergedArgs.worldHeight) || '?'
        };
    } else if (mergedArgs.worldSize) {
        scene.bgDimensions = { w: mergedArgs.worldSize, h: mergedArgs.worldSize };
    }

    // If the background script specifies camera configurations, merge them
    if (config.cameraConfigs) {
        if (!scene.cameraConfigs) {
            scene.cameraConfigs = config.cameraConfigs;
        } else {
            const existing = scene.cameraConfigs || [];
            const newConfigs = config.cameraConfigs;
            
            const filteredExisting = existing.filter(e => 
                !newConfigs.some(n => n.name === e.name || n.layer === e.layer)
            );
            
            scene.cameraConfigs = [...newConfigs, ...filteredExisting];
        }
    }

    if (config.backgroundColor !== undefined) {
        scene.backgroundColor = config.backgroundColor;
    }

    if (config.enableAtmosphere !== undefined) {
        scene.enableAtmosphere = config.enableAtmosphere;
        scene.atmosphereIntensity = config.atmosphereIntensity ?? 0.8;
    }

    return config;
};

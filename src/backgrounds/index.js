import { WatercolorBackground } from './WatercolorBackground';
import { RedCathedralBackground } from './RedCathedralBackground';
import { RainbowCathedralBackground } from './RainbowCathedralBackground';
import { ComplexityBackground } from './ComplexityBackground';
import { resolveCameras } from '../camera_effects/CameraRegistry';

const REGISTRY = {
    'watercolor': WatercolorBackground,
    'red_cathedral': RedCathedralBackground,
    'rainbow_cathedral': RainbowCathedralBackground,
    'complexity': ComplexityBackground,
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

    // Pre-initialize auxLayers object
    if (!scene.auxLayers) scene.auxLayers = {};

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

    // Resolve camera configurations from either 'cameraConfigs' (full objects) or 'cameras' (registry names)
    const backgroundCameras = config.cameraConfigs || resolveCameras(config.cameras || []);

    // If the background script specifies camera configurations, merge them
    if (backgroundCameras && backgroundCameras.length > 0) {
        if (!scene.cameraConfigs) {
            scene.cameraConfigs = backgroundCameras;
        } else {
            const existing = scene.cameraConfigs || [];
            const newConfigs = backgroundCameras;
            
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

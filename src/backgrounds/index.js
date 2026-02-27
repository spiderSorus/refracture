import { CathedralBackground } from './CathedralBackground';
import { PinkBlueCathedral } from './PinkBlueCathedral';
import { RainbowCathedral } from './RainbowCathedral';
import { ComplexityBackground } from './ComplexityBackground';
import { Complexity2Background } from './Complexity2Background';
import { GreyBoxBackground } from './GreyBoxBackground';

const REGISTRY = {
    'cathedral': CathedralBackground,
    'cathedral_pink_blue': PinkBlueCathedral,
    'rainbow_cathedral': RainbowCathedral,
    'stained_rainbow': RainbowCathedral, // Reuses same generation logic
    'complexity': ComplexityBackground,
    'complexity2': Complexity2Background,
    'greybox': GreyBoxBackground
};

/**
 * Global background loader.
 * @param {string} name - Key of the background in REGISTRY.
 * @param {Phaser.Scene} scene - The scene instance.
 * @param {Object} args - Custom arguments for the background script.
 */
export const loadBackground = (name, scene, args = {}) => {
    const backgroundScript = REGISTRY[name];
    if (!backgroundScript) {
        console.error(`[BACKGROUND] No background found named: ${name}`);
        return;
    }

    const cam = scene.cameras.main;
    const bounds = cam.useBounds ? cam._bounds : { x: 0, y: -8000, width: 8000, height: 8000 };

    const mergedArgs = {
        minX: bounds.x,
        minY: bounds.y,
        worldWidth: bounds.width,
        worldHeight: bounds.height,
        ...args
    };

    const config = backgroundScript(scene, mergedArgs) || {};
    scene.currentBackground = name;
    
    // Store dimensions for debug UI
    if (mergedArgs.worldWidth || mergedArgs.worldHeight) {
        scene.bgDimensions = {
            w: mergedArgs.worldWidth || '?',
            h: mergedArgs.worldHeight || '?'
        };
    } else if (mergedArgs.worldSize) {
        scene.bgDimensions = { w: mergedArgs.worldSize, h: mergedArgs.worldSize };
    }

    // If the background script specifies a color, set it on the scene for CameraSystem to use
    if (config.backgroundColor !== undefined) {
        scene.backgroundColor = config.backgroundColor;
    }

    // Apply atmosphere if specified
    if (config.enableAtmosphere !== undefined) {
        scene.enableAtmosphere = config.enableAtmosphere;
        scene.atmosphereIntensity = config.atmosphereIntensity ?? 0.8;
    }

    return config;
};

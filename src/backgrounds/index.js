import { CathedralBackground } from './CathedralBackground';
import { PinkBlueCathedral } from './PinkBlueCathedral';
import { RainbowCathedral } from './RainbowCathedral';
import { ComplexityBackground } from './ComplexityBackground';
import { Complexity2Background } from './Complexity2Background';

const REGISTRY = {
    'cathedral': CathedralBackground,
    'cathedral_pink_blue': PinkBlueCathedral,
    'rainbow_cathedral': RainbowCathedral,
    'stained_rainbow': RainbowCathedral, // Reuses same generation logic
    'complexity': ComplexityBackground,
    'complexity2': Complexity2Background
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

    const config = backgroundScript(scene, args) || {};
    scene.currentBackground = name;
    
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

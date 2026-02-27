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
    const bounds = cam.useBounds ? cam._bounds : { x: -2500, y: -2500, width: 5000, height: 5000 };

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

    // If the background script specifies camera configurations, merge them
    if (config.cameraConfigs) {
        if (!scene.cameraConfigs) {
            scene.cameraConfigs = config.cameraConfigs;
        } else {
            // Merge: avoid duplicates by layer or name if possible, but generally we want both
            // For now, let's just prepend background cameras to the list
            // so they are processed (and sorted) correctly.
            const existing = scene.cameraConfigs || [];
            const newConfigs = config.cameraConfigs;
            
            // Filter out existing ones that might conflict by name or layer
            const filteredExisting = existing.filter(e => 
                !newConfigs.some(n => n.name === e.name || n.layer === e.layer)
            );
            
            scene.cameraConfigs = [...newConfigs, ...filteredExisting];
        }
    }

    // Apply atmosphere if specified
    if (config.enableAtmosphere !== undefined) {
        scene.enableAtmosphere = config.enableAtmosphere;
        scene.atmosphereIntensity = config.atmosphereIntensity ?? 0.8;
    }

    return config;
};

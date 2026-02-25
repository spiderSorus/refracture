import { CathedralBackground } from './CathedralBackground';
import { PinkBlueCathedral } from './PinkBlueCathedral';
import { RainbowCathedral } from './RainbowCathedral';

const REGISTRY = {
    'cathedral': CathedralBackground,
    'cathedral_pink_blue': PinkBlueCathedral,
    'rainbow_cathedral': RainbowCathedral
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

    backgroundScript(scene, args);
};

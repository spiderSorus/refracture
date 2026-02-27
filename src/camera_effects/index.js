/**
 * Global camera effects registry.
 * Effects are functions that take a camera and a scene, and apply configuration.
 */

import { AquarelleEffect } from './AquarelleEffect';
import { GrayscaleEffect } from './GrayscaleEffect';
import { OldGlassEffect } from './OldGlassEffect';
import { RainbowEffect } from './RainbowEffect';
import { StainedGlassEffect } from './StainedGlassEffect';

const REGISTRY = {
    'watercolor': AquarelleEffect,
    'grayscale': GrayscaleEffect,
    'old_glass': OldGlassEffect,
    'rainbow': RainbowEffect,
    'stainedGlass': StainedGlassEffect,
};

export const applyCameraEffect = (name, camera, scene, config = {}) => {
    const effectScript = REGISTRY[name];
    if (!effectScript) {
        console.warn(`[CAMERA] No effect found named: ${name}`);
        return;
    }

    effectScript(camera, scene, config);
};

export const getEffectList = () => Object.keys(REGISTRY);

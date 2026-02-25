/**
 * Global camera effects registry.
 * Effects are functions that take a camera and a scene, and apply configuration.
 */

import { AquarelleEffect } from './AquarelleEffect';

const REGISTRY = {
    'watercolor': AquarelleEffect,
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

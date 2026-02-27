import { AquarelleEffect } from './AquarelleEffect';

/**
 * Stained Glass Camera Effect
 * A specialized version of the watercolor effect with reduced distortion (50% by default).
 */
export const StainedGlassEffect = (camera, scene, config = {}) => {
    const mergedConfig = { scale: 0.5, ...config };
    AquarelleEffect(camera, scene, mergedConfig);
};

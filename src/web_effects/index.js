import { SilkEffect } from './SilkEffect';
import { SparkleEffect } from './SparkleEffect';
import { VoidEffect } from './VoidEffect';

const REGISTRY = {
    'silk': SilkEffect,
    'sparkle': SparkleEffect,
    'void': VoidEffect
};

/**
 * Global web effect manager.
 * Effects handle the visual rendering of a web tether or connection.
 */
export const applyWebEffect = (name, scene, data) => {
    const effectClass = REGISTRY[name] || REGISTRY['silk'];
    
    // We expect each effect to be a class that manages its own graphics/emitters
    // data: { id, x1, y1, x2, y2, tension, maxLength, currentLength, isTether }
    
    if (!scene._webEffects) scene._webEffects = new Map();
    
    let effect = scene._webEffects.get(data.id);
    if (!effect) {
        effect = new effectClass(scene);
        scene._webEffects.set(data.id, effect);
    }
    
    effect.update(data);
};

export const cleanupWebEffects = (scene, activeIds) => {
    if (!scene._webEffects) return;
    
    for (const [id, effect] of scene._webEffects.entries()) {
        if (!activeIds.has(id)) {
            effect.destroy();
            scene._webEffects.delete(id);
        }
    }
};

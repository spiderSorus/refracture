/**
 * Global camera effects registry.
 * Effects are functions that take a camera and a scene, and apply configuration.
 */

const REGISTRY = {
    'watercolor': (camera, scene, config = {}) => {
        camera.setPostPipeline('AquarellePipeline');
        const pipeline = camera.getPostPipeline('AquarellePipeline');
        if (pipeline && config.scale !== undefined) pipeline.scale = config.scale;
    },
    'stainedGlass': (camera, scene, config = {}) => {
        camera.setPostPipeline('AquarellePipeline');
        const pipeline = camera.getPostPipeline('AquarellePipeline');
        pipeline.scale = config.scale ?? 0.5; // Default to 50%
    },
    'grayscale': (camera) => camera.setPostPipeline('GrayscalePipeline'),
    'old_glass': (camera) => camera.setPostPipeline('OldGlassPipeline'),
    'rainbow': (camera) => camera.setPostPipeline('RainbowPipeline'),
};

/**
 * Applies a registered effect to a Phaser camera.
 * @param {string} name - Effect key in REGISTRY
 * @param {Phaser.Cameras.Scene2D.Camera} camera 
 * @param {Phaser.Scene} scene 
 * @param {Object} config - Optional parameters for the effect
 */
export const applyCameraEffect = (name, camera, scene, config = {}) => {
    const effectFn = REGISTRY[name];
    if (!effectFn) {
        console.warn(`[CAMERA] No effect found named: ${name}`);
        return;
    }

    effectFn(camera, scene, config);
};

export const getEffectList = () => Object.keys(REGISTRY);

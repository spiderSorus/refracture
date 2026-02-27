/**
 * Aquarelle Camera Effect
 * Applies the watercolor distortion pipeline to a specific camera.
 */
export const AquarelleEffect = (camera, scene, config = {}) => {
    // Pipeline must be registered in the game config (done in app.js usually)
    // We just need to add it to the camera
    camera.setPostPipeline('AquarellePipeline');
    
    const pipeline = camera.getPostPipeline('AquarellePipeline');
    if (pipeline && config.scale !== undefined) {
        pipeline.scale = config.scale;
    }
};

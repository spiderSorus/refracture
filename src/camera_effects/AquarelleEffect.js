/**
 * Aquarelle Camera Effect
 * Applies the watercolor distortion pipeline to a specific camera.
 */
export const AquarelleEffect = (camera, scene, config = {}) => {
    // Pipeline must be registered in the game config (done in app.js usually)
    // We just need to add it to the camera
    camera.setPostPipeline('AquarellePipeline');
    
    // Optional: Pass uniforms if the pipeline supports per-instance data
    // (AquarellePipeline currently reads from its own state, but we could extend it)
};

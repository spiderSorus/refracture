/**
 * Rainbow Camera Effect
 * Applies a horizontal rainbow gradient to a specific camera.
 */
export const RainbowEffect = (camera, scene, config = {}) => {
    camera.setPostPipeline('RainbowPipeline');
};

/**
 * Old Glass Camera Effect
 * Applies a distorted glass pane effect to a specific camera.
 */
export const OldGlassEffect = (camera, scene, config = {}) => {
    camera.setPostPipeline('OldGlassPipeline');
};

/**
 * Grayscale Camera Effect
 * Applies the black and white grayscale pipeline to a specific camera.
 */
export const GrayscaleEffect = (camera, scene, config = {}) => {
    camera.setPostPipeline('GrayscalePipeline');
};

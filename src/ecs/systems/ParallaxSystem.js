/**
 * ParallaxSystem
 * Now a no-op because parallax is handled by the LayeredRenderSystem 
 * using Phaser's built-in setScrollFactor, which is more robust and doesn't 
 * interfere with physical positions.
 */
export const ParallaxSystem = (entities, scene) => {
    // Parallax logic has been moved to LayeredRenderSystem using setScrollFactor
};

/**
 * Utility for immediate-mode rendering systems using Phaser.Graphics.
 * Handles creation, clearing, and depth management of the graphics object.
 */
export const getImmediateGfx = (scene, key, depth) => {
    if (!scene[key]) {
        scene[key] = scene.add.graphics().setDepth(depth);
    }
    scene[key].clear();
    return scene[key];
};

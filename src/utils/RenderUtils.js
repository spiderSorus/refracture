/**
 * Utility for immediate-mode rendering systems using Phaser.Graphics.
 * Handles creation, clearing, and depth management of the graphics object.
 */
export const getImmediateGfx = (scene, key, depth, layer = null) => {
    if (!scene[key]) {
        scene[key] = scene.add.graphics();
        if (depth !== undefined) scene[key].setDepth(depth);
        if (layer) {
            layer.add(scene[key]);
        }
    }
    scene[key].clear();
    return scene[key];
};

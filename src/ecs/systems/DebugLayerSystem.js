import { GRID } from '../../core/Constants';

export const DebugLayerSystem = (scene) => {
    if (!scene.showDebugGrid) {
        if (scene.debugGraphics) scene.debugGraphics.clear();
        return;
    }

    if (!scene.debugGraphics) {
        scene.debugGraphics = scene.add.graphics().setDepth(1500);
    }

    scene.debugGraphics.clear();
    const cam = scene.cameras.main;
    const worldView = cam.worldView;

    scene.debugGraphics.lineStyle(1, 0x0000ff, 0.5);

    const startX = Math.floor(worldView.x / GRID.UNIT) * GRID.UNIT;
    const endX = Math.ceil(worldView.right / GRID.UNIT) * GRID.UNIT;
    const startY = Math.floor(worldView.y / GRID.UNIT) * GRID.UNIT;
    const endY = Math.ceil(worldView.bottom / GRID.UNIT) * GRID.UNIT;

    for (let x = startX; x <= endX; x += GRID.UNIT) {
        for (let y = startY; y <= endY; y += GRID.UNIT) {
            const crossSize = 2 / cam.zoom;
            scene.debugGraphics.moveTo(x - crossSize, y);
            scene.debugGraphics.lineTo(x + crossSize, y);
            scene.debugGraphics.moveTo(x, y - crossSize);
            scene.debugGraphics.lineTo(x, y + crossSize);
        }
    }
    scene.debugGraphics.strokePath();
};
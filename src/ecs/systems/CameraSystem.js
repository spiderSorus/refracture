import Phaser from 'phaser';

export const CameraSystem = (entities, scene) => {
    const targets = entities.filter(e => e.components.CameraTarget && e.components.Position);
    if (targets.length === 0) return;

    const cam = scene.cameras.main;
    const padding = 100; // Extra space around entities

    // 1. Calculate the bounding box of all targets
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    targets.forEach(e => {
        const { x, y } = e.components.Position;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    });

    // 2. Calculate midpoint (LookAt point)
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 3. Calculate required zoom
    const width = (maxX - minX) + (padding * 2);
    const height = (maxY - minY) + (padding * 2);

    const zoomX = scene.scale.width / width;
    const zoomY = scene.scale.height / height;

    // Use the smaller zoom level to ensure everything fits
    const targetZoom = Math.min(zoomX, zoomY, 1.5); // Cap zoom at 1.5x

    // 4. Apply to camera with a slight lerp for smoothness
    cam.centerOn(
        Phaser.Math.Linear(cam.midPoint.x, centerX, 0.1),
        Phaser.Math.Linear(cam.midPoint.y, centerY, 0.1)
    );

    cam.setZoom(Phaser.Math.Linear(cam.zoom, targetZoom, 0.05));
};
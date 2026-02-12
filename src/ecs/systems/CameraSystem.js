export const CameraSystem = (entities, scene) => {
    const targets = entities.filter(e => e.components.CameraTarget && e.components.Position);
    if (targets.length === 0) return;

    const cam = scene.cameras.main;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    targets.forEach(t => {
        const { x, y } = t.components.Position;
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = (maxX - minX) + 200;
    const height = (maxY - minY) + 200;

    const targetZoom = Math.min(cam.width / width, cam.height / height, 1.5);

    cam.pan(centerX, centerY, 500, 'Power2');
    cam.zoomTo(targetZoom, 500, 'Power2');
};
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

    const padding = 250;
    const width = (maxX - minX) + padding;
    const height = (maxY - minY) + padding;

    cam.centerOn((minX + maxX) / 2, (minY + maxY) / 2);

    const targetZoom = Math.min(cam.width / width, cam.height / height, 1.2);
    cam.setZoom(targetZoom);
};
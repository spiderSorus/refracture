export const CameraSystem = (entities, scene) => {
    const targets = entities.filter(e => e.components.CameraTarget && e.components.Position);
    if (targets.length === 0) return;

    const cam = scene.cameras.main;

    // 1. Find the bounds of all targets
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    targets.forEach(t => {
        const { x, y } = t.components.Position;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    });

    // 2. Calculate Center
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 3. Calculate Required Zoom
    const padding = 100; // Keep targets away from screen edges
    const width = (maxX - minX) + padding * 2;
    const height = (maxY - minY) + padding * 2;

    const zoomX = cam.width / width;
    const zoomY = cam.height / height;
    const targetZoom = Math.min(zoomX, zoomY, 1.5); // Cap zoom so it doesn't get too pixelated

    // 4. Smoothly Pan and Zoom
    cam.pan(centerX, centerY, 100, 'Linear', true);
    cam.zoomTo(targetZoom, 100, 'Linear', true);
};
export const CameraSystem = (entities, scene, inputManager) => {
    const cam = scene.cameras.main;
    const player = entities.find(e => e.components.PlayerTag && e.components.Position);

    // --- ZOOM LOGIC ---
    if (inputManager) {
        const zoomDelta = inputManager.getZoom();
        const zoomSpeed = 0.02;
        let newZoom = cam.zoom + (zoomDelta * zoomSpeed);
        
        // --- BOUNDS CONSTRAINT ---
        // Calculate the minimum zoom required to fill the viewport with the world bounds
        if (cam.useBounds) {
            const minZoomX = cam.width / cam._bounds.width;
            const minZoomY = cam.height / cam._bounds.height;
            const minZoom = Math.max(minZoomX, minZoomY);
            newZoom = Math.max(newZoom, minZoom);
        }

        // Clamp zoom between calculated min and 4x
        newZoom = Phaser.Math.Clamp(newZoom, 0.1, 4.0);
        cam.setZoom(newZoom);
    }

    if (!player) {
        cam.centerOn(0, 0);
        return;
    }

    const pPos = player.components.Position;
    let targetX = pPos.x;
    let targetY = pPos.y;

    const lerp = 0.1;
    const currentX = cam.scrollX + cam.width / 2;
    const currentY = cam.scrollY + cam.height / 2;

    const newX = currentX + (targetX - currentX) * lerp;
    const newY = currentY + (targetY - currentY) * lerp;

    cam.centerOn(newX, newY);
};

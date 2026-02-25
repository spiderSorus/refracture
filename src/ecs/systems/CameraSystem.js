export const CameraSystem = (entities, scene, inputManager, alpha = 1.0) => {
    const cam = scene.cameras.main;
    cam.setBackgroundColor('rgba(0,0,0,0)');
    
    // --- BACKGROUND CAMERA SETUP ---
    // Check if background camera exists and is still valid/active in the current scene
    const isBgCamValid = scene.bgCamera && scene.cameras.cameras.includes(scene.bgCamera);
    
    if (!isBgCamValid) {
        // Create background camera that matches main camera size
        scene.bgCamera = scene.cameras.add(0, 0, cam.width, cam.height).setName('BackgroundCamera');
        
        // Move background camera to the bottom of the render stack (index 0)
        const cameras = scene.cameras.cameras;
        if (cameras.length > 1) {
            const bgCamInstance = cameras.pop();
            cameras.unshift(bgCamInstance);
        }
    }
    const bgCam = scene.bgCamera;

    // --- LAYER IGNORING ---
    // If layers exist, set up ignoring. We do this every frame to ensure new layers are handled,
    // though usually they are created once.
    if (scene.bgLayer) {
        cam.ignore(scene.bgLayer);
    }
    if (scene.fgLayer && bgCam) {
        bgCam.ignore(scene.fgLayer);
    }
    if (scene.foreLayer && bgCam) {
        bgCam.ignore(scene.foreLayer);
    }

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
        // Still sync cameras even if no player, in case the scene moved the camera manually
        if (bgCam) {
            bgCam.setScroll(cam.scrollX, cam.scrollY);
            bgCam.setZoom(cam.zoom);
            bgCam.setRotation(cam.rotation);
        }
        return;
    }

    const pPos = player.components.Position;
    
    // --- SNAP ON INITIAL DETECT ---
    // If the camera is at its default or a far-off position, snap it once
    if (!scene._camInitialized) {
        cam.centerOn(pPos.x, pPos.y);
        scene._camInitialized = true;
    }

    // Use interpolated position for camera target
    const targetX = pPos.prevX !== undefined ? pPos.prevX + (pPos.x - pPos.prevX) * alpha : pPos.x;
    const targetY = pPos.prevY !== undefined ? pPos.prevY + (pPos.y - pPos.prevY) * alpha : pPos.y;

    const lerp = 0.1;
    const currentX = cam.scrollX + cam.width / 2;
    const currentY = cam.scrollY + cam.height / 2;

    const newX = currentX + (targetX - currentX) * lerp;
    const newY = currentY + (targetY - currentY) * lerp;

    cam.centerOn(newX, newY);

    // --- FINAL SYNC CAMERAS (After main camera has moved) ---
    if (bgCam) {
        bgCam.setScroll(cam.scrollX, cam.scrollY);
        bgCam.setZoom(cam.zoom);
        bgCam.setRotation(cam.rotation);
    }
};

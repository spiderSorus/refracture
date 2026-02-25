import { applyCameraEffect } from '../../camera_effects/index';
import Phaser from 'phaser';

/**
 * CameraSystem
 * Manages the main camera and multiple auxiliary cameras for background/foreground effects.
 * Reads from scene.cameraConfigs: Array<{ name, layer, effect, type: 'BACK'|'FORE' }>
 */
export const CameraSystem = (entities, scene, inputManager, alpha = 1.0) => {
    const mainCam = scene.cameras.main;
    mainCam.setBackgroundColor('rgba(0,0,0,0)');
    
    // 1. DYNAMIC CAMERA INITIALIZATION
    if (!scene.auxCameras) scene.auxCameras = {};
    if (!scene.auxLayers) scene.auxLayers = {};

    // Default configuration if none provided
    const configs = scene.cameraConfigs || [
        { name: 'BackgroundCamera', layer: 'bgLayer', type: 'BACK' }
    ];

    configs.forEach(cfg => {
        // Create Camera if missing or invalid
        const existingCam = scene.auxCameras[cfg.name];
        const isValid = existingCam && scene.cameras.cameras.includes(existingCam);

        if (!isValid) {
            const newCam = scene.cameras.add(0, 0, mainCam.width, mainCam.height).setName(cfg.name);
            scene.auxCameras[cfg.name] = newCam;

            // Sort depth
            if (cfg.type === 'BACK') {
                // Move to bottom of render stack
                const cams = scene.cameras.cameras;
                const idx = cams.indexOf(newCam);
                if (idx > 0) {
                    cams.splice(idx, 1);
                    cams.unshift(newCam);
                }
            }

            // Apply Effect
            if (cfg.effect) {
                applyCameraEffect(cfg.effect, newCam, scene);
            }
        }

        // Create Layer if missing
        if (!scene.auxLayers[cfg.layer]) {
            // Check if scene already has this layer by name (e.g. from create())
            if (scene[cfg.layer] && scene[cfg.layer] instanceof Phaser.GameObjects.Layer) {
                scene.auxLayers[cfg.layer] = scene[cfg.layer];
            } else {
                scene.auxLayers[cfg.layer] = scene.add.layer().setName(cfg.layer.toUpperCase());
            }
        }

        // Ensure cameras ignore the right layers
        const cam = scene.auxCameras[cfg.name];
        const layer = scene.auxLayers[cfg.layer];

        // Main camera ignores all auxiliary layers
        mainCam.ignore(layer);

        // Auxiliary camera ignores common layers
        if (scene.bgLayer && scene.bgLayer !== layer) cam.ignore(scene.bgLayer);
        if (scene.fgLayer && scene.fgLayer !== layer) cam.ignore(scene.fgLayer);
        if (scene.foreLayer && scene.foreLayer !== layer) cam.ignore(scene.foreLayer);
        
        // Also ignore other auxiliary layers
        Object.values(scene.auxLayers).forEach(otherLayer => {
            if (otherLayer !== layer) cam.ignore(otherLayer);
        });
    });

    // Special case for backward compatibility or default bgLayer
    if (scene.bgLayer && !Object.values(scene.auxLayers).includes(scene.bgLayer)) {
        mainCam.ignore(scene.bgLayer);
    }

    const player = entities.find(e => e.components.PlayerTag && e.components.Position);

    // --- ZOOM LOGIC ---
    if (inputManager) {
        const zoomDelta = inputManager.getZoom();
        const zoomSpeed = 0.02;
        let newZoom = mainCam.zoom + (zoomDelta * zoomSpeed);
        
        if (mainCam.useBounds) {
            const minZoomX = mainCam.width / mainCam._bounds.width;
            const minZoomY = mainCam.height / mainCam._bounds.height;
            const minZoom = Math.max(minZoomX, minZoomY);
            newZoom = Math.max(newZoom, minZoom);
        }

        newZoom = Phaser.Math.Clamp(newZoom, 0.1, 4.0);
        mainCam.setZoom(newZoom);
    }

    // --- SYNC ALL CAMERAS ---
    const syncAux = (cam) => {
        if (!cam) return;
        cam.setScroll(mainCam.scrollX, mainCam.scrollY);
        cam.setZoom(mainCam.zoom);
        cam.setRotation(mainCam.rotation);
    };

    if (!player) {
        Object.values(scene.auxCameras).forEach(syncAux);
        return;
    }

    const pPos = player.components.Position;
    
    if (!scene._camInitialized) {
        mainCam.centerOn(pPos.x, pPos.y);
        scene._camInitialized = true;
    }

    const targetX = pPos.prevX !== undefined ? pPos.prevX + (pPos.x - pPos.prevX) * alpha : pPos.x;
    const targetY = pPos.prevY !== undefined ? pPos.prevY + (pPos.y - pPos.prevY) * alpha : pPos.y;

    const lerp = 0.1;
    const currentX = mainCam.scrollX + mainCam.width / 2;
    const currentY = mainCam.scrollY + mainCam.height / 2;

    const newX = currentX + (targetX - currentX) * lerp;
    const newY = currentY + (targetY - currentY) * lerp;

    mainCam.centerOn(newX, newY);

    // Final Sync
    Object.values(scene.auxCameras).forEach(syncAux);
};

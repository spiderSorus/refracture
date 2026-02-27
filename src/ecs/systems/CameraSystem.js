import { applyCameraEffect } from '../../camera_effects/index';
import Phaser from 'phaser';

/**
 * CameraSystem
 * Manages the main camera and multiple auxiliary cameras for background/foreground effects.
 * Reads from scene.cameraConfigs: Array<{ name, layer, effect, type: 'BACKGROUND'|'PLAY'|'FOREGROUND'|'UI' }>
 */
export const CameraSystem = (entities, scene, inputManager, alpha = 1.0) => {
    const mainCam = scene.cameras.main;
    
    // 1. DYNAMIC CAMERA INITIALIZATION
    if (!scene.auxCameras) scene.auxCameras = {};
    if (!scene.auxLayers) scene.auxLayers = {};

    // Default configuration if none provided
    const configs = scene.cameraConfigs || [
        { name: 'BackgroundCamera', layer: 'backgroundLayer', type: 'BACKGROUND' }
    ];

    // Track if any changes require a sort
    let needsSort = false;

    configs.forEach(cfg => {
        // Create Camera if missing or invalid
        const existingCam = scene.auxCameras[cfg.name];
        const isValid = existingCam && scene.cameras.cameras.includes(existingCam);

        if (!isValid) {
            const newCam = scene.cameras.add(0, 0, mainCam.width, mainCam.height).setName(cfg.name);
            newCam.auxType = cfg.type; // Tag for sorting
            
            // For background layers, we want to know their parallax factor for sorting
            if (cfg.type === 'BACKGROUND') {
                const firstEntity = entities.find(e => e.components.ZLayer?.layerName === cfg.layer);
                newCam.parallaxFactor = firstEntity?.components.Parallax?.factor ?? 1.0;
            }

            scene.auxCameras[cfg.name] = newCam;
            needsSort = true;

            // Apply Effect
            if (cfg.effect) {
                applyCameraEffect(cfg.effect, newCam, scene);
            }
        }
    });

    // --- CAMERA SORTING ---
    // Render Order (Bottom to Top): BACKGROUND -> PLAY (main) -> FOREGROUND -> UI
    if (needsSort) {
        const TYPE_ORDER = { 'BACKGROUND': 0, 'PLAY': 1, 'FOREGROUND': 2, 'UI': 3 };
        
        scene.cameras.cameras.sort((a, b) => {
            if (a === mainCam) return TYPE_ORDER['PLAY'] - (TYPE_ORDER[b.auxType] ?? 1.5);
            if (b === mainCam) return (TYPE_ORDER[a.auxType] ?? 1.5) - TYPE_ORDER['PLAY'];
            
            const orderA = TYPE_ORDER[a.auxType] ?? 1;
            const orderB = TYPE_ORDER[b.auxType] ?? 1;
            
            if (orderA !== orderB) return orderA - orderB;
            
            // Within BACKGROUND, sort by parallax (furthest first)
            if (orderA === 0) {
                return (a.parallaxFactor ?? 0) - (b.parallaxFactor ?? 0);
            }
            
            return 0;
        });
    }

    // --- COLOR & LAYER MANAGEMENT ---
    // Determine if we have any BACKGROUND cameras that would be obscured by mainCam background
    const hasBackCameras = configs.some(cfg => cfg.type === 'BACKGROUND');
    if (hasBackCameras) {
        mainCam.setBackgroundColor('rgba(0,0,0,0)');
    } else if (scene.backgroundColor != null) {
        mainCam.setBackgroundColor(scene.backgroundColor);
    }

    // Set all aux cameras to transparent first
    Object.values(scene.auxCameras).forEach(cam => cam.setBackgroundColor('rgba(0,0,0,0)'));
    
    // Set the lowest camera's background color
    const lowestCam = scene.cameras.cameras[0];
    if (lowestCam && lowestCam !== mainCam && scene.backgroundColor != null) {
        lowestCam.setBackgroundColor(scene.backgroundColor);
    }

    // Create all layers first
    configs.forEach(cfg => {
        if (!scene.auxLayers[cfg.layer]) {
            // Check if the scene already has a layer property with this name
            if (scene[cfg.layer] && scene[cfg.layer] instanceof Phaser.GameObjects.Layer) {
                scene.auxLayers[cfg.layer] = scene[cfg.layer];
            } else {
                scene.auxLayers[cfg.layer] = scene.add.layer().setName(cfg.layer.toUpperCase());
            }
        }
    });

    // Isolate camera rendering
    const allAuxLayers = Object.values(scene.auxLayers);
    mainCam.ignore(allAuxLayers);
    
    configs.forEach(cfg => {
        const cam = scene.auxCameras[cfg.name];
        const designatedLayer = scene.auxLayers[cfg.layer];
        const otherLayers = allAuxLayers.filter(l => l !== designatedLayer);
        
        // Ensure auxiliary cameras ignore all legacy layers and web layers unless they are the designated one
        const ignoreList = [
            scene.backgroundLayer, 
            scene.playground, 
            scene.foregroundLayer,
            scene.uiLayer,
            scene.webLayer
        ].filter(l => l && l !== designatedLayer);
        
        cam.ignore([...ignoreList, ...otherLayers]);
    });

    // Special case for backward compatibility or default backgroundLayer
    if (scene.backgroundLayer && !allAuxLayers.includes(scene.backgroundLayer)) {
        mainCam.ignore(scene.backgroundLayer);
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

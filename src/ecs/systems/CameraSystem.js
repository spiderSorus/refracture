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
        { name: 'BackgroundCamera', layer: 'backgroundLayer', type: 'BACKGROUND' },
        { name: 'UICamera', layer: 'uiLayer', type: 'UI' }
    ];

    // Ensure a UI camera always exists in the configs if not present
    if (!configs.find(cfg => cfg.type === 'UI')) {
        configs.push({ name: 'UICamera', layer: 'uiLayer', type: 'UI' });
    }

    // Track if any changes require a sort
    let needsSort = false;

    configs.forEach(cfg => {
        // Create Camera if missing or invalid
        const existingCam = scene.auxCameras[cfg.name];
        const isValid = existingCam && scene.cameras.cameras.includes(existingCam);

        if (!isValid) {
            console.log(`[CAMERA] Creating new ${cfg.type} camera: ${cfg.name} for layer: ${cfg.layer}`);
            const newCam = scene.cameras.add(0, 0, mainCam.width, mainCam.height).setName(cfg.name);
            newCam.auxType = cfg.type; // Tag for sorting
            newCam.targetLayer = cfg.layer; // For debug reporting
            
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

    // 1.5 CLEANUP ORPHAN CAMERAS
    const activeNames = configs.map(c => c.name);
    Object.keys(scene.auxCameras).forEach(name => {
        if (!activeNames.includes(name)) {
            const cam = scene.auxCameras[name];
            if (cam && scene.cameras.cameras.includes(cam)) {
                scene.cameras.remove(cam);
            }
            delete scene.auxCameras[name];
        }
    });

    // --- CAMERA SORTING ---
    // Render Order (Bottom to Top): BACKGROUND -> PLAY (main) -> FOREGROUND -> UI
    // Run this every frame to ensure order is maintained
    const TYPE_ORDER = { 'BACKGROUND': 0, 'PLAY': 1, 'FOREGROUND': 2, 'UI': 3 };
    
    // Tag the web camera if it exists
    if (scene.webCamera) {
        scene.webCamera.auxType = 'FOREGROUND';
        scene.webCamera.name = scene.webCamera.name || 'WEB_CAMERA';
    }

    // Create a map for quick index lookup from configs to preserve original order within types
    const configOrder = {};
    configs.forEach((cfg, idx) => {
        configOrder[cfg.name] = idx;
    });

    scene.cameras.cameras.sort((a, b) => {
        const typeA = a === mainCam ? 'PLAY' : (a.auxType || 'PLAY');
        const typeB = b === mainCam ? 'PLAY' : (b.auxType || 'PLAY');

        const orderA = TYPE_ORDER[typeA];
        const orderB = TYPE_ORDER[typeB];
        
        if (orderA !== orderB) return orderA - orderB;
        
        // Within BACKGROUND, sort by parallax (furthest first)
        if (orderA === 0) {
            return (a.parallaxFactor ?? 0) - (b.parallaxFactor ?? 0);
        }

        // Within same type (PLAY, etc.), preserve order from configs
        // mainCam is treated as being at the start of its type block unless explicitly configured
        const idxA = a === mainCam ? -1 : (configOrder[a.name] ?? 999);
        const idxB = b === mainCam ? -1 : (configOrder[b.name] ?? 999);
        
        return idxA - idxB;
    });

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
    // allManagedAuxLayers includes all aux layers AND the uiLayer AND webLayer
    const allManagedLayers = [...allAuxLayers, scene.webLayer, scene.uiLayer].filter(l => l);

    // 1. MAIN CAMERA ignores ALL managed auxiliary layers (including UI)
    mainCam.ignore(allManagedLayers);
    mainCam.renderedLayers = ['MAIN'];
    
    // 2. WEB CAMERA ignores EVERYTHING except its own layer
    if (scene.webCamera) {
        const webIgnore = [...allAuxLayers, scene.uiLayer, scene.backgroundLayer, scene.playground, scene.foregroundLayer].filter(l => l && l !== scene.webLayer);
        scene.webCamera.ignore(webIgnore);
        scene.webCamera.renderedLayers = ['WEB'];
    }
    
    // Explicitly tag the UI layer if it's managed by a camera
    configs.forEach(cfg => {
        const cam = scene.auxCameras[cfg.name];
        if (!cam) return;

        if (cfg.type === 'UI' || cfg.layer === 'uiLayer') {
            cam.renderedLayers = ['UI'];
        } else {
            cam.renderedLayers = [cfg.layer];
            if (cfg.includeUI) cam.renderedLayers.push('UI');
        }
    });
    
    // 3. AUXILIARY CAMERAS (Background, Foreground, etc.)
    configs.forEach(cfg => {
        const cam = scene.auxCameras[cfg.name];
        if (!cam) return;

        const designatedLayer = scene.auxLayers[cfg.layer] || (cfg.layer === 'uiLayer' ? scene.uiLayer : null);
        
        // Auxiliary cameras must ignore all standard layers and other managed layers
        // except their own.
        const standardLayers = [scene.backgroundLayer, scene.playground, scene.foregroundLayer, scene.webLayer].filter(l => l);
        const otherAuxLayers = allAuxLayers.filter(l => l !== designatedLayer);
        
        const ignoreList = [...standardLayers, ...otherAuxLayers];
        
        // Add UI to ignore list ONLY if we don't want to include it
        if (!cfg.includeUI && scene.uiLayer && designatedLayer !== scene.uiLayer) {
            ignoreList.push(scene.uiLayer);
        }

        const finalIgnore = [...new Set(ignoreList.filter(l => l && l !== designatedLayer))];
        cam.ignore(finalIgnore);
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
        // UI cameras should stay static at (0,0) with zoom 1.0
        if (cam.auxType === 'UI') {
            cam.setScroll(0, 0);
            cam.setZoom(1.0);
            cam.setRotation(0);
            return;
        }
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

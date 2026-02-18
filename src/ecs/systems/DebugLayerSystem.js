export const DebugLayerSystem = (entities, scene) => {
    // Safety check: ensure scene exists
    if (!scene || !scene.add) return;

    // 1. Create or Re-create if missing/destroyed
    if (!scene.debugText || !scene.debugText.active) {
        scene.debugText = scene.add.text(10, 10, '', {
            font: '16px monospace',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#00000088'
        });

        scene.debugText.setScrollFactor(0).setDepth(2000);
    }

    const cam = scene.cameras.main;
    const uiScale = 1 / cam.zoom;

    scene.debugText.setScale(uiScale);
    scene.debugText.setPosition(10 * uiScale, 10 * uiScale);

    const player = entities.find(e => e.components.PlayerTag);
    let debugInfo = `SCENE: ${scene.scene.key}\n`;

    if (player) {
        const { Position: pos, Parent: parent } = player.components;
        // Safety check for components
        if (pos) {
            debugInfo += `POS: ${Math.round(pos.x)}, ${Math.round(pos.y)}\n`;
        }

        if (parent) {
            debugInfo += `STATUS: ATTACHED\n`;
            debugInfo += `PARENT: ${parent.id}\n`;
            debugInfo += `OFFSET: ${Math.round(parent.offset.x)}, ${Math.round(parent.offset.y)}\n`;
        } else {
            debugInfo += `STATUS: FREE\n`;
        }
    }

    // 2. Only update text if the object has a valid texture frame
    if (scene.debugText.frame) {
        scene.debugText.setText(debugInfo);
    }
};
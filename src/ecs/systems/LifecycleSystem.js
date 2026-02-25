// src/ecs/systems/LifecycleSystem.js
import { spawnPlayer } from '../entities/player';

export const LifecycleSystem = (entities, dt, scene) => {
    const cam = scene.cameras.main;
    const maxY = cam.useBounds ? cam._bounds.y + cam._bounds.height : scene.sys.game.config.height;

    entities.forEach(entity => {
        const { Position: pos, PlayerTag: isPlayer, Destructible: destructible, Respawn: respawn } = entity.components;

        // 1. Check for destruction (Floor hit)
        if (isPlayer && pos && destructible && !entity.toDestroy) {
            if (pos.y >= maxY - 10) { // Tiny buffer from floor
                console.log("[LIFECYCLE] Player hit floor. Destroying...");
                entity.toDestroy = true;
                
                // If the player has a respawn component, handle the logic elsewhere or set pending
                if (respawn) {
                    respawn.isPending = true;
                }
            }
        }
    });

    // 2. Handle Respawn Logic
    const playerExists = entities.some(e => e.components.PlayerTag && !e.toDestroy);
    
    if (!playerExists) {
        if (scene._respawnTimer === undefined) scene._respawnTimer = 0;
        
        scene._respawnTimer += dt * 1000;
        
        if (scene._respawnTimer >= 1000) { // 1 second respawn delay
            const spawnPoint = entities.find(e => e.components.SpawnTag);
            if (spawnPoint) {
                spawnPlayer(scene, spawnPoint);
            }
            scene._respawnTimer = 0;
        }
    } else {
        scene._respawnTimer = 0;
    }
};

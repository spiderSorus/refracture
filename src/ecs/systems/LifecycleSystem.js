// src/ecs/systems/LifecycleSystem.js
import { spawnPlayer } from '../entities/player';

export const LifecycleSystem = (entities, dt, scene) => {
    const cam = scene.cameras.main;
    
    // Define floor as the bottom of the world bounds
    let maxY = 10000; // Default
    if (cam.useBounds) {
        maxY = cam._bounds.y + cam._bounds.height;
    } else if (scene.physics && scene.physics.world && scene.physics.world.bounds) {
        maxY = scene.physics.world.bounds.y + scene.physics.world.bounds.height;
    }

    entities.forEach(entity => {
        const { Position: pos, PlayerTag: isPlayer, Destructible: destructible } = entity.components;

        // 1. Check for destruction (Floor hit)
        if (isPlayer && pos && destructible && !entity.toDestroy) {
            if (pos.y >= maxY - 20) { // Buffer from floor
                console.log(`[LIFECYCLE] Player hit floor at ${pos.y} (maxY: ${maxY}). Destroying...`);
                entity.toDestroy = true;
            }
        }
    });

    // 2. Handle Respawn Logic
    const playerExists = entities.some(e => e.components.PlayerTag && !e.toDestroy);
    
    if (!playerExists) {
        if (scene._respawnTimer === undefined) scene._respawnTimer = 0;
        
        scene._respawnTimer += dt * 1000;
        
        if (scene._respawnTimer >= 500) { // 0.5 second respawn delay
            const spawnPoint = entities.find(e => e.components.SpawnTag);
            if (spawnPoint) {
                console.log("[LIFECYCLE] Respawning player at spawn point.");
                spawnPlayer(scene, spawnPoint);
            } else {
                // Fallback: spawn at 0,0 if no spawn point found (though there should be one)
                console.warn("[LIFECYCLE] No spawn point found for respawn!");
            }
            scene._respawnTimer = 0;
        }
    } else {
        scene._respawnTimer = 0;
    }
};

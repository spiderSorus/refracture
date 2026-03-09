// src/ecs/systems/DriftSystem.js
import { createPlatform } from '../entities/platforms';
import { Drift, ZLayer, GravityExempt } from '../components/index';

export const DriftSystem = (entities, dtSeconds, scene) => {
    const player = entities.find(e => e.components.PlayerTag && !e.toDestroy);
    if (!player) return;

    const pPos = player.components.Position;
    if (!pPos) return;

    const cam = scene.cameras.main;
    const viewW = cam.displayWidth || scene.scale.width;
    const viewH = cam.displayHeight || scene.scale.height;
    const spawnRange = Math.max(viewW, viewH); // ~2x view roughly if we use this as radius
    const cleanupRange = spawnRange * 2.5;

    // 1. UPDATE EXISTING DRIFTERS
    entities.forEach(entity => {
        const drift = entity.components.Drift;
        const pos = entity.components.Position;
        const vel = entity.components.Velocity;
        const rot = entity.components.Rotation;

        if (drift && pos && vel) {
            // Apply drift to velocity
            vel.x = drift.vx;
            vel.y = drift.vy;

            if (rot) {
                rot.angle += drift.vrot * dtSeconds;
            }

            // Cleanup: Destroy if too far from player
            const dx = pos.x - pPos.x;
            const dy = pos.y - pPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > cleanupRange) {
                entity.toDestroy = true;
            }
        }
    });

    // 2. SPAWN NEW DRIFTERS
    if (!scene._driftTimer) scene._driftTimer = 0;
    scene._driftTimer += dtSeconds * 1000;

    const driftCount = entities.filter(e => e.components.Drift).length;
    const MAX_DRIFTERS = 30; // Slightly lower for performance

    if (scene._driftTimer >= 800 && driftCount < MAX_DRIFTERS) {
        scene._driftTimer = 0;

        // Spawn at random distance and angle (at the edge of view)
        const angle = Math.random() * Math.PI * 2;
        const distance = spawnRange * (0.8 + Math.random() * 0.4);
        const sx = pPos.x + Math.cos(angle) * distance;
        const sy = pPos.y + Math.sin(angle) * distance;

        // Random drift direction
        const dvx = (Math.random() - 0.5) * 100;
        const dvy = (Math.random() - 0.5) * 100;
        const dvrot = (Math.random() - 0.5) * 1;

        const size = 60 + Math.random() * 140;
        
        scene.addEntity([
            ...createPlatform(sx, sy, { 
                width: size, 
                height: size * 0.4, 
                isStatic: false, // Must be dynamic to bounce
                color: 0x555555 
            }),
            Drift(dvx, dvy, dvrot),
            GravityExempt(),
            ZLayer('PLAY', 5)
        ]);
    }
};

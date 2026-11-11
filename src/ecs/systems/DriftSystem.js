// src/ecs/systems/DriftSystem.js
import { createPlatform } from '../entities/platforms';
import { Drift, ZLayer, GravityExempt } from '../components/index';
import { isOverlapping } from '../../utils/CollisionUtils';

export const DriftSystem = (entities, dtSeconds, scene) => {
    const player = entities.find(e => e.components.PlayerTag && !e.toDestroy);
    if (!player) return;

    const pPos = player.components.Position;
    if (!pPos) return;

    const cam = scene.cameras.main;
    // Use zoom to calculate world-space view size. 
    // If minZoom exists, use that for the "max boundary".
    const baseZoom = cam.minZoom || cam.zoom || 1.0;
    const worldViewW = scene.scale.width / baseZoom;
    const worldViewH = scene.scale.height / baseZoom;
    
    const spawnRange = Math.max(worldViewW, worldViewH); 
    const cleanupRange = spawnRange * 2.5;

    // 1. UPDATE ALL DRIFTING ENTITIES
    entities.forEach(entity => {
        const drift = entity.components.Drift;
        const pos = entity.components.Position;
        const rot = entity.components.Rotation;

        if (drift && pos) {
            // Smoothly move position
            pos.prevX = pos.x;
            pos.prevY = pos.y;
            pos.x += (drift.vx || 0) * dtSeconds;
            pos.y += (drift.vy || 0) * dtSeconds;

            // Smoothly update rotation if present
            if (rot && drift.vrot) {
                rot.angle += drift.vrot * dtSeconds;
            }

            // Optional cleanup for transient drifting platforms
            if (entity.components.DynamicDrifterTag && pPos) {
                const dx = pos.x - pPos.x;
                const dy = pos.y - pPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > cleanupRange) {
                    entity.toDestroy = true;
                }
            }
        }
    });

    // 2. SPAWN DYNAMIC DRIFTING PLATFORMS (Only in scenes that opt in)
    if (!scene.enableDriftingPlatforms) return;

    if (!scene._driftTimer) scene._driftTimer = 0;
    scene._driftTimer += dtSeconds * 1000;

    const driftCount = entities.filter(e => e.components.DynamicDrifterTag).length;
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

        const size = 300 + Math.random() * 200;
        
        const newPos = { x: sx, y: sy };
        const newCol = { type: 'circle', radius: size / 2 };

        if (!isOverlapping(newPos, newCol, entities)) {
            const platform = scene.addEntity([
                ...createPlatform(sx, sy, { 
                    width: size, 
                    shape: 'circle', 
                    isStatic: false, 
                    color: 0x555555 
                }),
                Drift(dvx, dvy, dvrot),
                GravityExempt(),
                ZLayer('PLAY', 5)
            ]);

            // Set initial velocity
            if (platform.components.Velocity) {
                platform.components.Velocity.x = dvx;
                platform.components.Velocity.y = dvy;
            }
        }
    }
};

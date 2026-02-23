// src/ecs/systems/PhysicsSystem.js
import { PHYSICS } from '../../core/Constants';

export const PhysicsSystem = (entities, delta) => {
    const dt = delta / 1000;
    const FLOOR_Y = 0;
    const GRAVITY = PHYSICS.GRAVITY || 980;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent } = entity.components;
        if (!pos) return;

        // --- 1. ATTACHED SYNC ---
        if (parent) {
            if (!parent.isWeb) {
                const platform = entities.find(e => e.id === parent.id);
                if (platform && platform.components.Position) {
                    pos.x = platform.components.Position.x + parent.offset.x;
                    pos.y = platform.components.Position.y + parent.offset.y;
                }
            }
            if (vel) { vel.x = 0; vel.y = 0; }
            return;
        }

        // --- 2. FREE MOVEMENT & GRAVITY ---
        if (vel) {
            // Apply Gravity (unless exempt)
            if (!entity.components.GravityExempt) {
                vel.y += GRAVITY * dt;
            }

            // Integrate Position
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            // --- 3. FLOOR COLLISION (Player Only for now) ---
            if (entity.components.PlayerTag) {
                const sling = entity.components.SlingshotJump;
                if (pos.y >= FLOOR_Y) {
                    pos.y = FLOOR_Y;
                    if (vel.y > 0) vel.y = 0;
                    
                    if (sling) {
                        sling.canJump = true;
                        sling.lastPlatformId = null;
                    }
                } else if (sling && !sling.isCharging && pos.y < -5) {
                    sling.canJump = false;
                }
            }
        }
    });
};
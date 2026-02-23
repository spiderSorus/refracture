// src/ecs/systems/MovementSystem.js
import { GRID } from '../../core/Constants';
import { isPointInside } from '../../utils/CollisionUtils';

export const MovementSystem = (entities, inputManager, dt) => {
    if (!inputManager) return;
    const move = inputManager.getMovement();
    const walkSpeed = GRID.SPEED * GRID.UNIT * 2;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent, Rotation: rot, SlingshotJump: sling, WebTether: tether } = entity.components;
        if (!pos || !rot) return;

        // --- 1. ROTATION LOGIC ---
        if (sling && sling.isCharging && sling.lockedAim) {
            rot.angle = Math.atan2(-sling.lockedAim.y, -sling.lockedAim.x);
        }
        else if (Math.abs(move.x) > 0.1 || Math.abs(move.y) > 0.1) {
            rot.angle = Math.atan2(move.y, move.x);
        }
        else if (!parent && vel && (Math.abs(vel.x) > 10 || Math.abs(vel.y) > 10)) {
            rot.angle = Math.atan2(vel.y, vel.x);
        }

        // --- 2. PARENT EXIT LOGIC ---
        if (parent) {
            const plat = entities.find(e => e.id === parent.id);
            if (!plat || !plat.components.Position) {
                delete entity.components.Parent;
                return;
            }

            // NORMAL PLATFORM MOVEMENT
            parent.offset.x += (move.x * walkSpeed * dt);
            parent.offset.y += (move.y * walkSpeed * dt);

            const exitBuffer = 25;
            const isStillInside = isPointInside(parent.offset, { x: 0, y: 0 }, plat.components.Collider, exitBuffer);

            if (!isStillInside) {
                if (sling) sling.lastPlatformId = parent.id;
                delete entity.components.Parent;
            }
        } 
        // --- 3. FREEFALL FRICTION LOGIC ---
        else if (vel) {
            const isGrounded = pos.y >= 0;

            if (isGrounded) {
                vel.x += (move.x * walkSpeed * 10) * dt;
                vel.x *= 0.85;
            } else {
                const friction = tether ? 0.999 : 0.95;
                vel.x *= friction;
                vel.y *= (tether ? 0.999 : 0.99);
            }
        }
    });
};

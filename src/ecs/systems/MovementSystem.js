// src/ecs/systems/MovementSystem.js
import { GRID } from '../../core/Constants';
import { isPointInside, pointToSegmentDist } from '../../utils/CollisionUtils';

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
            if (!plat) {
                delete entity.components.Parent;
                return;
            }

            if (parent.isWeb) {
                // SPECIAL WEB MOVEMENT
                const col = plat.components.Collider;
                if (col && col.webData) {
                    const { x1, y1, x2, y2 } = col.webData;
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const nx = dx / len;
                    const ny = dy / len;

                    // Move along the line based on input projected onto web vector
                    // We also allow vertical stick to contribute if it's diagonal
                    const moveMag = (move.x * nx + move.y * ny) * walkSpeed * dt;
                    
                    pos.x += nx * moveMag;
                    pos.y += ny * moveMag;

                    // Keep player snapped to the line
                    // Calculate current t (projection factor)
                    let t = ((pos.x - x1) * nx + (pos.y - y1) * ny) / len;
                    
                    // Exit if off ends
                    if (t < -0.01 || t > 1.01) {
                        delete entity.components.Parent;
                    } else {
                        // Snap exactly to the line segment
                        pos.x = x1 + t * dx;
                        pos.y = y1 + t * dy;
                    }
                }
            } else {
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

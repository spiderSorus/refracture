// src/ecs/systems/MovementSystem.js
import { GRID, PHYSICS } from '../../core/Constants';
import { isPointInside } from '../../utils/CollisionUtils';

export const MovementSystem = (entities, inputManager, dt) => {
    if (!inputManager) return;
    const move = inputManager.getMovement();
    const walkSpeed = GRID.SPEED * GRID.UNIT * 2;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent, Rotation: rot, SlingshotJump: sling, WebTether: tether, PlayerTag: isPlayer } = entity.components;
        if (!pos || !rot) return;

        // --- 1. ROTATION LOGIC (Player Only) ---
        if (isPlayer) {
            const offset = Math.PI / 2;
            if (sling && sling.isCharging && sling.lockedAim) {
                rot.angle = Math.atan2(-sling.lockedAim.y, -sling.lockedAim.x) + offset;
            }
            else if (Math.abs(move.x) > 0.1 || Math.abs(move.y) > 0.1) {
                rot.angle = Math.atan2(move.y, move.x) + offset;
            }
            else if (!parent && vel && (Math.abs(vel.x) > 10 || Math.abs(vel.y) > 10)) {
                rot.angle = Math.atan2(vel.y, vel.x) + offset;
            }
        }

        // --- 2. PARENT MOVEMENT (Sliding Clamp) ---
        if (parent) {
            const plat = entities.find(e => e.id === parent.id);
            if (!plat || !plat.components.Position) {
                delete entity.components.Parent;
                return;
            }

            const pRot = plat.components.Rotation?.angle || 0;
            const cos = Math.cos(-pRot);
            const sin = Math.sin(-pRot);
            
            const localMoveX = move.x * cos - move.y * sin;
            const localMoveY = move.x * sin + move.y * cos;

            let nextOffsetX = parent.offset.x + (localMoveX * walkSpeed * dt);
            let nextOffsetY = parent.offset.y + (localMoveY * walkSpeed * dt);

            // CLAMP TO BOUNDARY instead of just stopping
            const col = plat.components.Collider;
            if (col.type === 'circle') {
                const dist = Math.sqrt(nextOffsetX**2 + nextOffsetY**2);
                if (dist > col.radius) {
                    nextOffsetX = (nextOffsetX / dist) * col.radius;
                    nextOffsetY = (nextOffsetY / dist) * col.radius;
                }
            } else if (col.type === 'rect') {
                const hw = col.width / 2;
                const hh = col.height / 2;
                nextOffsetX = Math.max(-hw, Math.min(hw, nextOffsetX));
                nextOffsetY = Math.max(-hh, Math.min(hh, nextOffsetY));
            }

            parent.offset.x = nextOffsetX;
            parent.offset.y = nextOffsetY;
        } 
        // --- 3. FREEFALL FRICTION LOGIC ---
        else if (vel) {
            // Player is grounded only if they have a Parent (attached to a platform)
            const isGrounded = !!parent;

            if (isGrounded) {
                vel.x += (move.x * walkSpeed * 10) * dt;
                vel.x *= PHYSICS.GROUND_FRICTION;
            } else {
                const fricX = tether ? PHYSICS.TETHER_AIR_RESISTANCE_X : PHYSICS.AIR_RESISTANCE_X;
                const fricY = tether ? PHYSICS.TETHER_AIR_RESISTANCE_Y : PHYSICS.AIR_RESISTANCE_Y;
                vel.x *= fricX;
                vel.y *= fricY;
            }
        }
    });
};

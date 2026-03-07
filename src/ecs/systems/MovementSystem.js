// src/ecs/systems/MovementSystem.js
import { GRID, PHYSICS, PLAYER } from '../../core/Constants';
import { isPointInside } from '../../utils/CollisionUtils';

export const MovementSystem = (entities, inputManager, dt) => {
    if (!inputManager) return;
    const move = inputManager.getMovement();
    const walkSpeed = PLAYER.WALK_SPEED;

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

            // --- 2a. WALL COLLISION CHECK (WHILE PARENTED) ---
            if (isPlayer) {
                const worldX = plat.components.Position.x + (nextOffsetX * Math.cos(pRot) - nextOffsetY * Math.sin(pRot));
                const worldY = plat.components.Position.y + (nextOffsetX * Math.sin(pRot) + nextOffsetY * Math.cos(pRot));
                const pRadius = entity.components.Collider?.radius || 10;

                const walls = entities.filter(e => e.components.WallTag && e.components.Collider && e.components.Position);
                for (const wall of walls) {
                    const wPos = wall.components.Position;
                    const wCol = wall.components.Collider;
                    const wRot = wall.components.Rotation?.angle || 0;

                    if (isPointInside({ x: worldX, y: worldY }, wPos, wCol, pRadius, wRot)) {
                        // Collision with wall! Revert movement.
                        nextOffsetX = parent.offset.x;
                        nextOffsetY = parent.offset.y;
                        break;
                    }
                }
            }

            // CLAMP TO BOUNDARY instead of just stopping
            const col = plat.components.Collider;
            const pRadius = entity.components.Collider?.radius || 0;

            if (col.type === 'circle') {
                const dist = Math.sqrt(nextOffsetX**2 + nextOffsetY**2);
                const limit = Math.max(0, col.radius - pRadius);
                if (dist > limit && dist > 0) {
                    nextOffsetX = (nextOffsetX / dist) * limit;
                    nextOffsetY = (nextOffsetY / dist) * limit;
                }
            } else if (col.type === 'rect') {
                const hw = Math.max(0, (col.width / 2) - pRadius);
                const hh = Math.max(0, (col.height / 2) - pRadius);
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
            const isBackground = !!entity.components.BackgroundTag;

            if (isGrounded) {
                vel.x += (move.x * PLAYER.GROUND_ACCEL) * dt;
                vel.x *= PHYSICS.GROUND_FRICTION;
            } else if (!isBackground) {
                // Apply standard linear friction (Zero if tethered)
                const fricX = tether ? 1.0 : PHYSICS.AIR_RESISTANCE_X;
                const fricY = tether ? 1.0 : PHYSICS.AIR_RESISTANCE_Y;
                vel.x *= fricX;
                vel.y *= fricY;

                // State-based Physics Drag (Disabled if tethered)
                if (isPlayer && sling && !tether) {
                    // Transition: If we were jumping but started falling vertically, end jump drag state
                    if (sling.isJumping && vel.y > 0) {
                        sling.isJumping = false;
                    }

                    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
                    if (speed > 10) {
                        // Use high drag during jump phase, low drag during fall
                        // This allows limiting horizontal range while keeping fall speed natural
                        const currentDragCoeff = sling.isJumping ? PHYSICS.JUMP_DRAG : PHYSICS.DRAG_COEFF;
                        const drag = 1.0 - (currentDragCoeff * speed * dt);
                        const safeDrag = Math.max(0.5, drag);
                        vel.x *= safeDrag;
                        vel.y *= safeDrag;
                    }
                }
            }
        }
    });
};

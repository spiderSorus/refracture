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

        // --- 0. JUMP ANIMATION (KINEMATIC) ---
        if (isPlayer && sling && sling.isAnimating) {
            sling.jumpProgress += dt / (sling.jumpDuration || 1);
            
            if (sling.jumpProgress >= 1.0) {
                // End of jump
                pos.x = sling.jumpTarget.x;
                pos.y = sling.jumpTarget.y;
                sling.isAnimating = false;
                
                if (vel) {
                    if (sling.jumpType === 'MISS') {
                        const dx = sling.jumpTarget.x - sling.jumpStart.x;
                        const dy = sling.jumpTarget.y - sling.jumpStart.y;
                        const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                        vel.x = (dx / d) * 100;
                        vel.y = (dy / d) * 100;
                    } else {
                        vel.x = 0; vel.y = 0;
                    }
                }
                sling.jumpProgress = 0;
                return;
            }

            // Calculate Linear Interpolation
            const t = sling.jumpProgress;
            const nextX = sling.jumpStart.x + (sling.jumpTarget.x - sling.jumpStart.x) * t;
            const nextY = sling.jumpStart.y + (sling.jumpTarget.y - sling.jumpStart.y) * t;

            // Calculate Parabolic Offset (Upward arc)
            const h = 4 * sling.jumpPeak * t * (1 - t);
            
            pos.x = nextX;
            pos.y = nextY - h; 

            // --- WALL COLLISION CHECK ---
            if (t > 0.05) {
                const platforms = entities.filter(e => e.components.PlatformTag && e.id !== sling.lastPlatformId);
                for (const plat of platforms) {
                    const platRot = plat.components.Rotation?.angle || 0;
                    if (isPointInside(pos, plat.components.Position, plat.components.Collider, 5, platRot)) {
                        sling.isAnimating = false;
                        if (vel) { 
                            vel.x = 0; 
                            vel.y = 100; // Small kick to start fall
                        }
                        console.log("💥 [JUMP] Hit Wall/Obstacle - Falling");
                        return;
                    }
                }
            }
            return; 
        }

        // --- 1. ROTATION LOGIC (Player Only) ---
        if (isPlayer) {
            const offset = Math.PI / 2;
            if (sling && sling.isCharging && sling.lockedAim) {
                rot.angle = Math.atan2(-sling.lockedAim.y, -sling.lockedAim.x) + offset;
            }
            else if (sling && sling.isAnimating) {
                const dx = sling.jumpTarget.x - sling.jumpStart.x;
                const dy = sling.jumpTarget.y - sling.jumpStart.y;
                rot.angle = Math.atan2(dy, dx) + offset;
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
            const isBackground = !!entity.components.BackgroundTag;

            if (isGrounded) {
                vel.x += (move.x * PLAYER.GROUND_ACCEL) * dt;
                vel.x *= PHYSICS.GROUND_FRICTION;
            } else if (!isBackground) {
                // Apply standard linear friction
                const fricX = tether ? PHYSICS.TETHER_AIR_RESISTANCE_X : PHYSICS.AIR_RESISTANCE_X;
                const fricY = tether ? PHYSICS.TETHER_AIR_RESISTANCE_Y : PHYSICS.AIR_RESISTANCE_Y;
                vel.x *= fricX;
                vel.y *= fricY;

                // Apply quadratic drag (primarily to X to limit jump distance without killing fall speed)
                if (isPlayer && PHYSICS.DRAG_COEFF > 0) {
                    const speedX = Math.abs(vel.x);
                    const speedY = Math.abs(vel.y);
                    
                    if (speedX > 10) {
                        const dragX = 1.0 - (PHYSICS.DRAG_COEFF * speedX * dt);
                        vel.x *= Math.max(0.5, dragX);
                    }
                    
                    // Much weaker drag on Y for "natural" fall
                    if (speedY > 10) {
                        const dragY = 1.0 - (PHYSICS.DRAG_COEFF * 0.1 * speedY * dt); 
                        vel.y *= Math.max(0.8, dragY);
                    }
                }
            }
        }
    });
};

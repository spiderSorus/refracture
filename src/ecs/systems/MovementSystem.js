// src/ecs/systems/MovementSystem.js
import Phaser from 'phaser';
import { GRID } from '../../core/Constants';

export const MovementSystem = (entities, inputManager, dt) => {
    if (!inputManager) return;
    const move = inputManager.getMovement();
    const walkSpeed = GRID.SPEED * GRID.UNIT * 2;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent } = entity.components;
        if (!pos) return;

        if (parent) {
            // Walk relative to the platform
            parent.offset.x += (move.x * walkSpeed * dt);
            parent.offset.y += (move.y * walkSpeed * dt);

            // DETACH: If we walk past the edge + buffer, we become Free
            const plat = entities.find(e => e.id === parent.id);
            if (plat) {
                const col = plat.components.Collider;
                const limit = (col.type === 'circle' ? col.radius : col.width / 2) + 25;
                const dist = col.type === 'circle'
                    ? Math.sqrt(parent.offset.x ** 2 + parent.offset.y ** 2)
                    : Math.abs(parent.offset.x);

                if (dist > limit) {
                    if (entity.components.SlingshotJump) entity.components.SlingshotJump.lastPlatformId = parent.id;
                    delete entity.components.Parent;
                }
            }
        } else if (vel) {
            // Horizontal walk on the Floor/Air
            const isGrounded = pos.y >= 0;
            vel.x += (move.x * (isGrounded ? walkSpeed * 10 : 1200)) * dt;
            vel.x *= isGrounded ? 0.85 : 0.95;
            vel.y += 1200 * dt; // Gravity
            vel.y *= 0.99;
        }
    });
};
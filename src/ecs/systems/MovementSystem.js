// src/ecs/systems/MovementSystem.js
import Phaser from 'phaser';
import { GRID, PHYSICS } from '../../core/Constants';

export const MovementSystem = (entities, inputManager, dt) => {
    if (!inputManager) return;
    const move = inputManager.getMovement();
    const walkSpeed = GRID.SPEED * GRID.UNIT * 2;

    entities.forEach(entity => {
        // ADDED WebTether to the destructured components
        const { Position: pos, Velocity: vel, Parent: parent, Rotation: rot, SlingshotJump: sling, WebTether: tether } = entity.components;
        if (!pos || !rot) return;

        // --- 1. ROTATION LOGIC (PRIORITY: JUMP VECTOR -> MOVEMENT) ---
        if (sling && sling.isCharging && sling.vector && (sling.vector.x !== 0 || sling.vector.y !== 0)) {
            rot.angle = Math.atan2(-sling.vector.y, -sling.vector.x);
        }
        else if (Math.abs(move.x) > 0.1 || Math.abs(move.y) > 0.1) {
            rot.angle = Math.atan2(move.y, move.x);
        }
        else if (!parent && vel && (Math.abs(vel.x) > 10 || Math.abs(vel.y) > 10)) {
            rot.angle = Math.atan2(vel.y, vel.x);
        }

        // --- 2. POSITION LOGIC ---
        if (parent) {
            // Player is attached to a platform
            parent.offset.x += (move.x * walkSpeed * dt);
            parent.offset.y += (move.y * walkSpeed * dt);

            const plat = entities.find(e => e.id === parent.id);
            if (plat) {
                const col = plat.components.Collider;
                const exitBuffer = 25;
                let exited = false;

                if (col.type === 'circle') {
                    const distSq = (parent.offset.x ** 2) + (parent.offset.y ** 2);
                    const limit = col.radius + exitBuffer;
                    if (distSq > limit * limit) exited = true;
                } else {
                    const hw = col.width / 2 + exitBuffer;
                    const hh = col.height / 2 + exitBuffer;
                    if (Math.abs(parent.offset.x) > hw || Math.abs(parent.offset.y) > hh) exited = true;
                }

                if (exited) {
                    if (sling) sling.lastPlatformId = parent.id;
                    delete entity.components.Parent;
                }
            }
        } else if (vel) {
            // Player is in freefall or dangling
            const isGrounded = pos.y >= 0;

            if (isGrounded) {
                // Walking on the hard floor (y >= 0)
                vel.x += (move.x * walkSpeed * 10) * dt;
                vel.x *= 0.85;
            } else {
                // --- THE FIX: TETHER BYPASS ---
                if (!tether) {
                    // Normal Freefall: apply standard slingshot air friction
                    vel.x *= 0.95;
                    vel.y *= 0.99;
                } else {
                    // On a Rope: DO NOT kill the momentum! Let the pendulum swing!
                    // Apply only a micro-fraction of air resistance so the swing lasts.
                    vel.x *= 0.999;
                    vel.y *= 0.999;
                }
            }

            // Always apply gravity when not parented
            vel.y += (PHYSICS.GRAVITY || 980) * dt;
        }
    });
};
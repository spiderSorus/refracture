import Phaser from 'phaser';
import { GRID } from '../../core/Constants';
import { Parent } from '../components/index';

export const MovementSystem = (entities, inputManager, dt) => {
    if (!inputManager) return;

    const walkSpeed = GRID.SPEED * GRID.UNIT * 2;
    const move = inputManager.getMovement();
    const now = Date.now();
    const RETRACT_SPEED = walkSpeed * 1.5;

    // Helper: Calculate net energy force
    const calculateEnergyForce = (x, y) => {
        let forceX = 0;
        let forceY = 0;

        entities.forEach(e => {
            if (e.components.EnergySource && e.components.Position) {
                const sourcePos = e.components.Position;
                const energy = e.components.EnergySource;

                // VOID CHECK
                const col = e.components.Collider;
                const dx = x - sourcePos.x;
                const dy = y - sourcePos.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let isOver = false;

                if (col) {
                    if (col.type === 'circle') isOver = dist <= col.radius;
                    else {
                        const w = col.width / 2, h = col.height / 2;
                        isOver = (Math.abs(dx) <= w && Math.abs(dy) <= h);
                    }
                }

                if (isOver && energy.strength < 0) return; // Ignore absorber pull inside void

                if (dist < 10) dist = 10;
                const magnitude = energy.strength / (dist * 0.02);

                forceX += (dx / dist) * magnitude;
                forceY += (dy / dist) * magnitude;
            }
        });
        return { x: forceX, y: forceY };
    };

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Rotation: rot, Parent: parent, InputControlled: input, WebTether: tether } = entity.components;
        if (!input || !pos) return;

        // ----------------------------------------------------------
        // MODE A: PARENTED (Walking on Platform)
        // ----------------------------------------------------------
        if (parent) {
            // 1. Rotation
            if (rot && (move.x !== 0 || move.y !== 0)) {
                rot.angle = Math.atan2(move.y, move.x);
            }

            const plat = entities.find(e => e.id === parent.id);
            const col = plat?.components.Collider;

            if (col) {
                let nextX = parent.offset.x + (move.x * walkSpeed * dt);
                let nextY = parent.offset.y + (move.y * walkSpeed * dt);

                // Collision Logic
                if (col.type === 'circle') {
                    const dist = Math.sqrt(nextX * nextX + nextY * nextY);
                    if (dist > col.radius) {
                        // HIT EDGE
                        if (tether) {
                            // JUMP!
                            // We only jump if we are moving AWAY from the tether anchor?
                            // Or just standard jump logic:
                            tether.jumpCooldown = now + 250;
                            delete entity.components.Parent;
                            // Do NOT delete tether. We swing off it.
                            return;
                        } else {
                            // Clamp to edge
                            const angle = Math.atan2(nextY, nextX);
                            nextX = Math.cos(angle) * col.radius;
                            nextY = Math.sin(angle) * col.radius;
                        }
                    }
                }
                parent.offset.x = nextX;
                parent.offset.y = nextY;
            }
            if (vel) { vel.x = 0; vel.y = 0; }
        }

        // ----------------------------------------------------------
        // MODE B: TETHERED FLIGHT (Energy Driven)
        // ----------------------------------------------------------
        else if (tether && !parent) {
            const anchorPlat = entities.find(e => e.id === tether.platformId);
            if (!anchorPlat) return;

            const aPos = anchorPlat.components.Position;
            const anchorX = aPos.x;
            const anchorY = aPos.y;

            // --- LANDING CHECK (Magnet) ---
            // If we hit ANY platform (including Anchor), snap to it.
            // But verify Cooldown first.
            if (!tether.jumpCooldown || now > tether.jumpCooldown) {

                const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);

                for (const targetPlat of platforms) {
                    const tPos = targetPlat.components.Position;
                    const tCol = targetPlat.components.Collider;
                    const dx = pos.x - tPos.x;
                    const dy = pos.y - tPos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    let isHit = false;

                    if (tCol.type === 'circle') isHit = dist <= tCol.radius;
                    // (add rect check if needed)

                    if (isHit) {
                        console.log("Magnet Landing!");
                        // 1. PARENT to the new platform
                        entity.components.Parent = Parent(targetPlat.id, { x: dx, y: dy });

                        // 2. DO NOT DELETE TETHER
                        // We keep the web attached so we can walk around "leashed".
                        return;
                    }
                }
            }

            // --- PHYSICS ---
            const dx = pos.x - anchorX;
            const dy = pos.y - anchorY;
            let currentRadius = Math.sqrt(dx * dx + dy * dy);
            let currentAngle = Math.atan2(dy, dx);

            const force = calculateEnergyForce(pos.x, pos.y);
            const dirX = dx / currentRadius;
            const dirY = dy / currentRadius;
            const tanX = -dirY;
            const tanY = dirX;

            const radialForce = (force.x * dirX) + (force.y * dirY);
            const tangentialForce = (force.x * tanX) + (force.y * tanY);

            // Radius Update
            if (inputManager.isButtonDown('SHORTEN')) {
                currentRadius -= RETRACT_SPEED * dt;
            } else if (radialForce > 0) {
                currentRadius += radialForce * dt;
            }
            if (currentRadius < 50) currentRadius = 50;

            // Angle Update
            const angularAccel = tangentialForce / currentRadius;
            currentAngle += angularAccel * dt * 5.0;

            // Resolve
            pos.x = anchorX + Math.cos(currentAngle) * currentRadius;
            pos.y = anchorY + Math.sin(currentAngle) * currentRadius;

            if (rot) rot.angle = currentAngle + (Math.PI / 2);
            if (vel) { vel.x = 0; vel.y = 0; }
        }

        // ----------------------------------------------------------
        // MODE C: FREE FALL
        // ----------------------------------------------------------
        else {
            const force = calculateEnergyForce(pos.x, pos.y);
            if (vel) {
                vel.x += force.x * dt;
                vel.y += force.y * dt;
                vel.x *= 0.98;
                vel.y *= 0.98;
            }
        }
    });
};
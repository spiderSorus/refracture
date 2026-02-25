// src/ecs/systems/PhysicsSystem.js
import { PHYSICS } from '../../core/Constants';
import Phaser from 'phaser';

export const PhysicsSystem = (entities, delta, scene) => {
    const dt = delta / 1000;
    const GRAVITY = PHYSICS.GRAVITY || 980;
    
    // Fallback bounds
    const defaultBounds = { x: -5000, y: -10000, width: 10000, height: 10000 };
    const bounds = scene?.cameras.main.getBounds() || defaultBounds;
    
    const minX = bounds.x;
    const maxX = bounds.x + bounds.width;
    const minY = bounds.y;
    const maxY = bounds.y + bounds.height; // BOTTOM OF THE MAP

    // FLOOR_Y is now the bottom of the world bounds
    const FLOOR_Y = maxY;

    // --- 0. UPDATE ROTATION (Spin) ---
    entities.forEach(entity => {
        const spin = entity.components.Spin;
        const rot = entity.components.Rotation;
        if (spin && rot) {
            rot.angle += spin.rate * dt;
        }
    });

    // 1. RESOLVE WEB TENSION FORCES
    entities.forEach(entity => {
        const tether = entity.components.WebTether;
        const pPos = entity.components.Position;
        const pVel = entity.components.Velocity;
        const pMass = entity.components.Mass?.value || 1;

        if (tether && pPos && pVel) {
            const platform = entities.find(e => e.id === tether.platformId);
            if (platform && platform.components.Position) {
                const platRot = platform.components.Rotation?.angle || 0;
                const localAnchorX = tether.anchorOffset.x;
                const localAnchorY = tether.anchorOffset.y;
                const ax = localAnchorX * Math.cos(platRot) - localAnchorY * Math.sin(platRot);
                const ay = localAnchorX * Math.sin(platRot) + localAnchorY * Math.cos(platRot);
                const targetX = platform.components.Position.x + ax;
                const targetY = platform.components.Position.y + ay;
                const dx = targetX - pPos.x;
                const dy = targetY - pPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > tether.maxLength) {
                    const overlap = dist - tether.maxLength;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    let force = overlap * tether.stiffness * 500;
                    if (entity.components.Parent) force *= 0.1;
                    tether.tension = force;
                    pVel.x += (nx * force / pMass) * dt;
                    pVel.y += (ny * force / pMass) * dt;

                    const platVel = platform.components.Velocity;
                    const isStatic = !!(platform.components.SpawnTag || platform.components.StaticTag);
                    if (platVel && !isStatic) {
                        const platMass = platform.components.Mass?.value || 10;
                        platVel.x -= (nx * force / platMass) * dt;
                        platVel.y -= (ny * force / platMass) * dt;
                    }
                } else { tether.tension = 0; }
            }
        }

        const conn = entity.components.WebConnection;
        if (conn) {
            const entA = entities.find(e => e.id === conn.fromId);
            const entB = entities.find(e => e.id === conn.toId);
            if (entA && entB && entA.components.Position && entB.components.Position) {
                const rotA = entA.components.Rotation?.angle || 0;
                const rotB = entB.components.Rotation?.angle || 0;
                const ax = conn.fromOffset.x * Math.cos(rotA) - conn.fromOffset.y * Math.sin(rotA);
                const ay = conn.fromOffset.x * Math.sin(rotA) + conn.fromOffset.y * Math.cos(rotA);
                const bx = conn.toOffset.x * Math.cos(rotB) - conn.toOffset.y * Math.sin(rotB);
                const by = conn.toOffset.x * Math.sin(rotB) + conn.toOffset.y * Math.cos(rotB);
                const worldAX = entA.components.Position.x + ax;
                const worldAY = entA.components.Position.y + ay;
                const worldBX = entB.components.Position.x + bx;
                const worldBY = entB.components.Position.y + by;
                const dx = worldBX - worldAX;
                const dy = worldBY - worldAY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const restLen = conn.fixedLength || 100;

                if (dist > restLen) {
                    const overlap = dist - restLen;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const force = overlap * conn.stiffness * 500;
                    conn.tension = force;
                    const massA = entA.components.Mass?.value || 10;
                    const massB = entB.components.Mass?.value || 10;
                    const staticA = !!(entA.components.SpawnTag || entA.components.StaticTag);
                    const staticB = !!(entB.components.SpawnTag || entB.components.StaticTag);
                    if (entA.components.Velocity && !staticA) {
                        entA.components.Velocity.x += (nx * force / massA) * dt;
                        entA.components.Velocity.y += (ny * force / massA) * dt;
                    }
                    if (entB.components.Velocity && !staticB) {
                        entB.components.Velocity.x -= (nx * force / massB) * dt;
                        entB.components.Velocity.y -= (ny * force / massB) * dt;
                    }
                } else { conn.tension = 0; }
            }
        }
    });

    // 2. APPLY INTEGRATION & WORLD COLLISION
    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent } = entity.components;
        if (!pos) return;

        if (parent) {
            const platform = entities.find(e => e.id === parent.id);
            if (platform && platform.components.Position) {
                const pRot = platform.components.Rotation?.angle || 0;
                const ox = parent.offset.x;
                const oy = parent.offset.y;
                const rx = ox * Math.cos(pRot) - oy * Math.sin(pRot);
                const ry = ox * Math.sin(pRot) + oy * Math.cos(pRot);
                pos.x = platform.components.Position.x + rx;
                pos.y = platform.components.Position.y + ry;
            }
            if (vel) { 
                entity.components._lastVel = { x: vel.x, y: vel.y };
                vel.x = 0; vel.y = 0; 
            }
            return;
        }

        if (vel) {
            const isPlayer = !!entity.components.PlayerTag;
            const isStatic = !!(entity.components.SpawnTag || entity.components.StaticTag);

            if (isStatic) {
                vel.x = 0;
                vel.y = 0;
            } else if (isPlayer) {
                vel.y += GRAVITY * dt;
            } else if (!entity.components.GravityExempt && !entity.components.PlatformTag) {
                vel.y += GRAVITY * dt;
            }

            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            // Player World Boundary Constraints (Walls/Ceiling)
            if (isPlayer) {
                const pRadius = 15;
                if (pos.x - pRadius < minX) { pos.x = minX + pRadius; vel.x = 0; }
                else if (pos.x + pRadius > maxX) { pos.x = maxX - pRadius; vel.x = 0; }
                if (pos.y - pRadius < minY) { pos.y = minY + pRadius; vel.y = 0; }
            }

            // Platform World Boundary Bouncing
            if (entity.components.PlatformTag && entity.components.Collider) {
                const col = entity.components.Collider;
                const radius = col.type === 'circle' ? col.radius : Math.max(col.width, col.height) / 2;
                const damping = 0.8;
                if (pos.x - radius < minX) { pos.x = minX + radius; vel.x = Math.abs(vel.x) * damping; }
                else if (pos.x + radius > maxX) { pos.x = maxX - radius; vel.x = -Math.abs(vel.x) * damping; }
                if (pos.y - radius < minY) { pos.y = minY + radius; vel.y = Math.abs(vel.y) * damping; }
                else if (pos.y + radius > maxY) { pos.y = maxY - radius; vel.y = -Math.abs(vel.y) * damping; }
            }
        }
    });

    // 3. RESOLVE COLLISIONS
    const platformsForCollision = entities.filter(e => e.components.PlatformTag && e.components.Collider && e.components.Position);
    for (let i = 0; i < platformsForCollision.length; i++) {
        for (let j = i + 1; j < platformsForCollision.length; j++) {
            const A = platformsForCollision[i];
            const B = platformsForCollision[j];
            const posA = A.components.Position; const posB = B.components.Position;
            const colA = A.components.Collider; const colB = B.components.Collider;
            const dist = Phaser.Math.Distance.Between(posA.x, posA.y, posB.x, posB.y);
            const radiusA = colA.type === 'circle' ? colA.radius : Math.max(colA.width, colA.height) / 2;
            const radiusB = colB.type === 'circle' ? colB.radius : Math.max(colB.width, colB.height) / 2;
            const minDist = radiusA + radiusB;

            if (dist < minDist && dist > 0) {
                const overlap = minDist - dist;
                const nx = (posB.x - posA.x) / dist; const ny = (posB.y - posA.y) / dist;
                const canA = !(A.components.SpawnTag || A.components.StaticTag);
                const canB = !(B.components.SpawnTag || B.components.StaticTag);
                if (canA && canB) {
                    posA.x -= nx * overlap * 0.5; posA.y -= ny * overlap * 0.5;
                    posB.x += nx * overlap * 0.5; posB.y += ny * overlap * 0.5;
                } else if (canA) { posA.x -= nx * overlap; posA.y -= ny * overlap; }
                else if (canB) { posB.x += nx * overlap; posB.y += ny * overlap; }

                const velA = A.components.Velocity; const velB = B.components.Velocity;
                if (velA && velB) {
                    const relativeVelX = velB.x - velA.x; const relativeVelY = velB.y - velA.y;
                    const velAlongNormal = relativeVelX * nx + relativeVelY * ny;
                    if (velAlongNormal < 0) {
                        const restitution = 0.8;
                        const massA = A.components.Mass?.value || 10; const massB = B.components.Mass?.value || 10;
                        let j = -(1 + restitution) * velAlongNormal; j /= 1 / massA + 1 / massB;
                        const impulseX = j * nx; const impulseY = j * ny;
                        if (canA) { velA.x -= 1 / massA * impulseX; velA.y -= 1 / massA * impulseY; }
                        if (canB) { velB.x += 1 / massB * impulseX; velB.y += 1 / massB * impulseY; }
                    }
                }
            }
        }
    }
};

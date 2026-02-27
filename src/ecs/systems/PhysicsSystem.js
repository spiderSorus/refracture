// src/ecs/systems/PhysicsSystem.js
import { PHYSICS } from '../../core/Constants';
import Phaser from 'phaser';

export const PhysicsSystem = (entities, delta, scene) => {
    const dt = delta / 1000;
    const GRAVITY = PHYSICS.GRAVITY || 980;
    
    // --- 0. PRE-CALCULATE WEB LOCKS ---
    const webbedPlatformIds = new Set();
    const activelyTuggedIds = new Set();

    entities.forEach(e => {
        const tether = e.components.WebTether;
        if (tether) {
            const targetPlat = entities.find(plat => plat.id === tether.platformId);
            const isTestBall = targetPlat?.components.EntityType?.value === 'TEST_BALL';
            if (!isTestBall) webbedPlatformIds.add(tether.platformId);
            if (tether.isActive) activelyTuggedIds.add(tether.platformId);
        }
        const conn = e.components.WebConnection;
        if (conn) {
            webbedPlatformIds.add(conn.fromId);
            webbedPlatformIds.add(conn.toId);
        }
    });

    const defaultBounds = { x: -5000, y: -10000, width: 10000, height: 10000 };
    const bounds = scene?.cameras.main.getBounds() || defaultBounds;
    const minX = bounds.x;
    const maxX = bounds.x + bounds.width;
    const minY = bounds.y;
    const maxY = bounds.y + bounds.height;

    // --- STORE PREVIOUS POSITION ---
    entities.forEach(entity => {
        const pos = entity.components.Position;
        if (pos) {
            pos.prevX = pos.x;
            pos.prevY = pos.y;
        }
    });

    // --- 1. ROTATION UPDATE ---
    entities.forEach(entity => {
        const spin = entity.components.Spin;
        const angVel = entity.components.AngularVelocity;
        const rot = entity.components.Rotation;
        const isSeesaw = !!entity.components.SeesawTag;
        
        if (rot) {
            if (spin) {
                rot.angle += spin.rate * dt;
            }
            if (angVel) {
                if (isSeesaw) {
                    const tag = entity.components.SeesawTag;
                    const isWebbed = webbedPlatformIds.has(entity.id);
                    const isTugged = activelyTuggedIds.has(entity.id);
                    const hasPlayer = entities.some(e => e.components.Parent?.id === entity.id);

                    if (tag.stiffness > 0) {
                        const restorative = -rot.angle * tag.stiffness;
                        angVel.rate += restorative * dt;
                    }

                    if (isWebbed && !isTugged) {
                        angVel.rate = 0;
                    } else if (!isWebbed && !hasPlayer && tag.stiffness === 0) {
                        angVel.rate = 0;
                    } else {
                        angVel.rate *= 0.95;
                    }
                } else {
                    angVel.rate *= 0.98;
                }

                // Apply angular velocity to rotation
                rot.angle += angVel.rate * dt;

                if (isSeesaw) {
                    const tag = entity.components.SeesawTag;
                    if (tag.maxRotation > 0) {
                        if (rot.angle > tag.maxRotation) { rot.angle = tag.maxRotation; angVel.rate = 0; }
                        else if (rot.angle < -tag.maxRotation) { rot.angle = -tag.maxRotation; angVel.rate = 0; }
                    }
                }
            }
        }
    });

    // --- 2. WEB CONNECTION SOLVER ---
    entities.forEach(entity => {
        const conn = entity.components.WebConnection;
        if (conn) {
            const entA = entities.find(e => e.id === conn.fromId);
            const entB = entities.find(e => e.id === conn.toId);
            if (entA && entB && entA.components.Position && entB.components.Position) {
                for (let i = 0; i < 2; i++) {
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
                        const nx = dx / dist; const ny = dy / dist;
                        const staticA = !!(entA.components.SpawnTag || entA.components.StaticTag);
                        const staticB = !!(entB.components.SpawnTag || entB.components.StaticTag);
                        const isSeesawA = !!entA.components.SeesawTag;
                        const isSeesawB = !!entB.components.SeesawTag;
                        const mobA = (staticA || isSeesawA) ? 0 : 1;
                        const mobB = (staticB || isSeesawB) ? 0 : 1;
                        const totalMob = mobA + mobB;
                        if (totalMob > 0) {
                            const move = overlap / totalMob;
                            if (mobA > 0) { entA.components.Position.x += nx * move; entA.components.Position.y += ny * move; }
                            if (mobB > 0) { entB.components.Position.x -= nx * move; entB.components.Position.y -= ny * move; }
                        }
                        if (isSeesawA && entA.components.AngularVelocity) {
                            const torque = (ax * (ny * overlap * 100) - ay * (nx * overlap * 100)) / (entA.components.Mass?.value * 10 || 1000);
                            entA.components.AngularVelocity.rate += torque;
                            entA.components.AngularVelocity.rate *= 0.5;
                        }
                        if (isSeesawB && entB.components.AngularVelocity) {
                            const torque = (bx * (-ny * overlap * 100) - by * (-nx * overlap * 100)) / (entB.components.Mass?.value * 10 || 1000);
                            entB.components.AngularVelocity.rate += torque;
                            entB.components.AngularVelocity.rate *= 0.5;
                        }
                        conn.tension = overlap * 1000;
                    } else { conn.tension = 0; }
                }
            }
        }
    });

    // --- 3. INTEGRATION & WORLD COLLISION ---
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
            return;
        }

        if (vel) {
            const isPlayer = !!entity.components.PlayerTag;
            const isStatic = !!(entity.components.SpawnTag || entity.components.StaticTag);
            const isSeesaw = !!entity.components.SeesawTag;
            const isWebbed = webbedPlatformIds.has(entity.id);
            const isTestBall = entity.components.EntityType?.value === 'TEST_BALL';

            if (isStatic || isSeesaw || (isWebbed && !isTestBall)) {
                vel.x = 0; vel.y = 0;
            } else if (isPlayer || isTestBall) {
                vel.y += GRAVITY * dt;
            } else if (!entity.components.GravityExempt && !entity.components.PlatformTag) {
                vel.y += GRAVITY * dt;
            }

            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            // Rolling Physics for Test Balls
            if (isTestBall && entity.components.AngularVelocity) {
                const radius = entity.components.Collider?.radius || 30;
                // Perfect rolling: v = omega * r => omega = v / r
                entity.components.AngularVelocity.rate = vel.x / radius;
            }

            // World Boundaries
            if (isPlayer) {
                const pRadius = 15;
                if (pos.x - pRadius < minX) { pos.x = minX + pRadius; vel.x = 0; }
                else if (pos.x + pRadius > maxX) { pos.x = maxX - pRadius; vel.x = 0; }
                if (pos.y - pRadius < minY) { pos.y = minY + pRadius; vel.y = 0; }
            }

            if (entity.components.PlatformTag && entity.components.Collider) {
                const col = entity.components.Collider;
                const halfW = col.type === 'circle' ? col.radius : (col.width / 2);
                const halfH = col.type === 'circle' ? col.radius : (col.height / 2);
                if (pos.x - halfW < minX) { pos.x = minX + halfW; vel.x = Math.abs(vel.x) * 0.8; }
                else if (pos.x + halfW > maxX) { pos.x = maxX - halfW; vel.x = -Math.abs(vel.x) * 0.8; }
                if (pos.y - halfH < minY) { pos.y = minY + halfH; vel.y = Math.abs(vel.y) * 0.8; }
                else if (pos.y + halfH > maxY) { pos.y = maxY - halfH; vel.y = -Math.abs(vel.y) * 0.8; }
            }
        }
    });

    // --- 4. COLLISION RESOLUTION ---
    const collidables = entities.filter(e => e.components.PlatformTag && e.components.Collider && e.components.Position);
    
    for (let i = 0; i < collidables.length; i++) {
        for (let j = i + 1; j < collidables.length; j++) {
            const A = collidables[i];
            const B = collidables[j];
            if (((A.components.ZLayer?.type === 'BACKGROUND') || A.components.BackgroundTag) !== ((B.components.ZLayer?.type === 'BACKGROUND') || B.components.BackgroundTag)) continue;
            
            const posA = A.components.Position; const posB = B.components.Position;
            const colA = A.components.Collider; const colB = B.components.Collider;
            
            let nx = 0, ny = 0, overlap = 0;
            let collided = false;
            let localCollisionInfo = null;

            // Case 1: Circle vs Circle
            if (colA.type === 'circle' && colB.type === 'circle') {
                const dx = posB.x - posA.x;
                const dy = posB.y - posA.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = colA.radius + colB.radius;
                if (dist < minDist && dist > 0) {
                    collided = true;
                    overlap = minDist - dist;
                    nx = dx / dist;
                    ny = dy / dist;
                }
            } 
            // Case 2: Circle vs Rect (or vice versa)
            else if ((colA.type === 'circle' && colB.type === 'rect') || (colA.type === 'rect' && colB.type === 'circle')) {
                const circle = colA.type === 'circle' ? A : B;
                const rect = colA.type === 'rect' ? A : B;
                const cPos = circle.components.Position;
                const rPos = rect.components.Position;
                const rCol = rect.components.Collider;
                const rRot = rect.components.Rotation?.angle || 0;

                // Transform circle center to rect's local space
                const dx = cPos.x - rPos.x;
                const dy = cPos.y - rPos.y;
                const cos = Math.cos(-rRot);
                const sin = Math.sin(-rRot);
                const localX = dx * cos - dy * sin;
                const localY = dx * sin + dy * cos;

                const hw = rCol.width / 2;
                const hh = rCol.height / 2;

                const closestX = Math.max(-hw, Math.min(hw, localX));
                const closestY = Math.max(-hh, Math.min(hh, localY));

                const ldx = localX - closestX;
                const ldy = localY - closestY;
                const lDistSq = ldx * ldx + ldy * ldy;

                if (lDistSq < circle.components.Collider.radius * circle.components.Collider.radius) {
                    collided = true;
                    const lDist = Math.sqrt(lDistSq);
                    let lnx, lny;

                    if (lDist > 0) {
                        overlap = circle.components.Collider.radius - lDist;
                        lnx = ldx / lDist;
                        lny = ldy / lDist;
                    } else {
                        // Circle center inside rect
                        const dL = localX + hw;
                        const dR = hw - localX;
                        const dT = localY + hh;
                        const dB = hh - localY;
                        const minD = Math.min(dL, dR, dT, dB);
                        overlap = circle.components.Collider.radius + minD;
                        if (minD === dL) { lnx = -1; lny = 0; }
                        else if (minD === dR) { lnx = 1; lny = 0; }
                        else if (minD === dT) { lnx = 0; lny = -1; }
                        else { lnx = 0; lny = 1; }
                    }

                    // Store info for torque
                    localCollisionInfo = { rect, closestX, closestY, lnx, lny };

                    // Rotate local normal back to world space
                    const cosW = Math.cos(rRot);
                    const sinW = Math.sin(rRot);
                    const wnx = lnx * cosW - lny * sinW;
                    const wny = lnx * sinW + lny * cosW;

                    // nx, ny should point from A to B
                    if (A === circle) {
                        nx = -wnx; ny = -wny;
                    } else {
                        nx = wnx; ny = wny;
                    }
                }
            }

            if (collided) {
                const canA = !(A.components.SpawnTag || A.components.StaticTag || A.components.SeesawTag || webbedPlatformIds.has(A.id));
                const canB = !(B.components.SpawnTag || B.components.StaticTag || B.components.SeesawTag || webbedPlatformIds.has(B.id));

                if (canA && canB) {
                    posA.x -= nx * overlap * 0.5; posA.y -= ny * overlap * 0.5;
                    posB.x += nx * overlap * 0.5; posB.y += ny * overlap * 0.5;
                } else if (canA) { posA.x -= nx * overlap; posA.y -= ny * overlap; }
                else if (canB) { posB.x += nx * overlap; posB.y += ny * overlap; }

                const velA = A.components.Velocity; const velB = B.components.Velocity;
                if (velA && velB) {
                    const relVelX = velB.x - velA.x; const relVelY = velB.y - velA.y;
                    const velAlongNormal = relVelX * nx + relVelY * ny;
                    if (velAlongNormal < 0) {
                        const rest = 0.8;
                        const massA = A.components.Mass?.value || 10; const massB = B.components.Mass?.value || 10;
                        let j = -(1 + rest) * velAlongNormal; j /= 1 / massA + 1 / massB;
                        if (canA) { velA.x -= 1 / massA * j * nx; velA.y -= 1 / massA * j * ny; }
                        if (canB) { velB.x += 1 / massB * j * nx; velB.y += 1 / massB * j * ny; }
                    }
                }
            }
        }
    }
};

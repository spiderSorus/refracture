// src/ecs/systems/PhysicsSystem.js
import { PHYSICS } from '../../core/Constants';
import Phaser from 'phaser';

export const PhysicsSystem = (entities, delta, scene) => {
    const dt = delta / 1000;
    const GRAVITY = PHYSICS.GRAVITY || 980;
    
    // --- 0. PRE-CALCULATE WEB LOCKS ---
    // Optimization: Find all platform IDs that have a web attached
    const webbedPlatformIds = new Set();
    const activelyTuggedIds = new Set();

    entities.forEach(e => {
        const tether = e.components.WebTether;
        if (tether) {
            webbedPlatformIds.add(tether.platformId);
            if (tether.isActive) activelyTuggedIds.add(tether.platformId);
        }
        const conn = e.components.WebConnection;
        if (conn) {
            webbedPlatformIds.add(conn.fromId);
            webbedPlatformIds.add(conn.toId);
        }
    });

    // Fallback bounds
    const defaultBounds = { x: -5000, y: -10000, width: 10000, height: 10000 };
    const bounds = scene?.cameras.main.getBounds() || defaultBounds;
    
    const minX = bounds.x;
    const maxX = bounds.x + bounds.width;
    const minY = bounds.y;
    const maxY = bounds.y + bounds.height; // BOTTOM OF THE MAP

    // FLOOR_Y is now the bottom of the world bounds
    const FLOOR_Y = maxY;

    // --- STORE PREVIOUS POSITION FOR INTERPOLATION ---
    entities.forEach(entity => {
        const pos = entity.components.Position;
        if (pos) {
            pos.prevX = pos.x;
            pos.prevY = pos.y;
        }
    });

    // --- 0. UPDATE ROTATION (Spin & AngularVelocity) ---
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
                // --- SEESAW DAMPING & FREEZING ---
                if (isSeesaw) {
                    const tag = entity.components.SeesawTag;
                    const isWebbed = webbedPlatformIds.has(entity.id);
                    const isTugged = activelyTuggedIds.has(entity.id);
                    const hasPlayer = entities.some(e => e.components.Parent?.id === entity.id);

                    // 1. Restorative force (Spring-back)
                    if (tag.stiffness > 0) {
                        const restorative = -rot.angle * tag.stiffness;
                        angVel.rate += restorative * dt;
                    }

                    // 2. Interaction check for locking
                    if (isWebbed && !isTugged) {
                        // "Web Freeze" - lock rotation if webbed but not being pulled
                        angVel.rate = 0;
                    } else if (!isWebbed && !hasPlayer && tag.stiffness === 0) {
                        // "Disconnect Freeze" - lock if nothing is touching it
                        angVel.rate = 0;
                    } else {
                        // Active interaction - apply friction
                        angVel.rate *= 0.95;
                    }

                    rot.angle += angVel.rate * dt;

                    // 3. Rotation Clamping
                    if (tag.maxRotation && tag.maxRotation > 0) {
                        if (rot.angle > tag.maxRotation) {
                            rot.angle = tag.maxRotation;
                            angVel.rate = 0;
                        } else if (rot.angle < -tag.maxRotation) {
                            rot.angle = -tag.maxRotation;
                            angVel.rate = 0;
                        }
                    }
                } else {
                    // Standard damping for other rotating objects
                    angVel.rate *= 0.98;
                    rot.angle += angVel.rate * dt;
                }
            }
        }
    });

    // 1. RESOLVE WEB TENSION FORCES
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
                        const nx = dx / dist;
                        const ny = dy / dist;
                        
                        const isStaticA = !!(entA.components.SpawnTag || entA.components.StaticTag);
                        const isStaticB = !!(entB.components.SpawnTag || entB.components.StaticTag);
                        const isSeesawA = !!entA.components.SeesawTag;
                        const isSeesawB = !!entB.components.SeesawTag;

                        // POSITION CORRECTION (Verlet Style)
                        const mobA = (isStaticA || isSeesawA) ? 0 : 1;
                        const mobB = (isStaticB || isSeesawB) ? 0 : 1;
                        const totalMob = mobA + mobB;

                        if (totalMob > 0) {
                            const move = overlap / totalMob;
                            if (mobA > 0) {
                                entA.components.Position.x += nx * move;
                                entA.components.Position.y += ny * move;
                            }
                            if (mobB > 0) {
                                entB.components.Position.x -= nx * move;
                                entB.components.Position.y -= ny * move;
                            }
                        }

                        // ANGULAR IMPULSE (For Seesaws)
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
                    } else {
                        conn.tension = 0;
                    }
                }
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
            const isSeesaw = !!entity.components.SeesawTag;
            const isWebbed = webbedPlatformIds.has(entity.id);

            if (isStatic || isSeesaw || isWebbed) {
                vel.x = 0;
                vel.y = 0;
            } else if (isPlayer) {
                vel.y += GRAVITY * dt;
            } else if (!entity.components.GravityExempt && !entity.components.PlatformTag) {
                vel.y += GRAVITY * dt;
            }

            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            // Player World Boundary Constraints
            if (isPlayer) {
                const pRadius = 15;
                if (pos.x - pRadius < minX) { pos.x = minX + pRadius; vel.x = 0; }
                else if (pos.x + pRadius > maxX) { pos.x = maxX - pRadius; vel.x = 0; }
                if (pos.y - pRadius < minY) { pos.y = minY + pRadius; vel.y = 0; }
            }

            // Platform World Boundary Bouncing
            if (entity.components.PlatformTag && entity.components.Collider) {
                const col = entity.components.Collider;
                const halfW = col.type === 'circle' ? col.radius : (col.width / 2);
                const halfH = col.type === 'circle' ? col.radius : (col.height / 2);
                const damping = 0.8;
                if (pos.x - halfW < minX) { pos.x = minX + halfW; vel.x = Math.abs(vel.x) * damping; }
                else if (pos.x + halfW > maxX) { pos.x = maxX - halfW; vel.x = -Math.abs(vel.x) * damping; }
                if (pos.y - halfH < minY) { pos.y = minY + halfH; vel.y = Math.abs(vel.y) * damping; }
                else if (pos.y + halfH > maxY) { pos.y = maxY - halfH; vel.y = -Math.abs(vel.y) * damping; }
            }
        }
    });

    // 3. RESOLVE COLLISIONS
    const platformsForCollision = entities.filter(e => {
        const isPlatform = e.components.PlatformTag && e.components.Collider && e.components.Position;
        if (!isPlatform) return false;
        const isBackground = e.components.BackgroundTag || e.components.ZLayer?.type === 'BACKGROUND';
        if (isBackground && !e.components.Velocity) return false;
        return true;
    });

    for (let i = 0; i < platformsForCollision.length; i++) {
        for (let j = i + 1; j < platformsForCollision.length; j++) {
            const A = platformsForCollision[i];
            const B = platformsForCollision[j];
            const zA = A.components.ZLayer;
            const zB = B.components.ZLayer;
            if (((zA && zA.type === 'BACKGROUND') || A.components.BackgroundTag) !== ((zB && zB.type === 'BACKGROUND') || B.components.BackgroundTag)) continue;
            
            const posA = A.components.Position; const posB = B.components.Position;
            const colA = A.components.Collider; const colB = B.components.Collider;
            const dist = Phaser.Math.Distance.Between(posA.x, posA.y, posB.x, posB.y);
            const radiusA = colA.type === 'circle' ? colA.radius : Math.max(colA.width, colA.height) / 2;
            const radiusB = colB.type === 'circle' ? colB.radius : Math.max(colB.width, colB.height) / 2;
            const minDist = radiusA + radiusB;

            if (dist < minDist && dist > 0) {
                const overlap = minDist - dist;
                const nx = (posB.x - posA.x) / dist; const ny = (posB.y - posA.y) / dist;
                
                const isStaticA = !!(A.components.SpawnTag || A.components.StaticTag);
                const isStaticB = !!(B.components.SpawnTag || B.components.StaticTag);
                const isSeesawA = !!A.components.SeesawTag;
                const isSeesawB = !!B.components.SeesawTag;
                const isWebbedA = webbedPlatformIds.has(A.id);
                const isWebbedB = webbedPlatformIds.has(B.id);

                const canMoveA = !isStaticA && !isSeesawA && !isWebbedA;
                const canMoveB = !isStaticB && !isSeesawB && !isWebbedB;

                if (canMoveA && canMoveB) {
                    posA.x -= nx * overlap * 0.5; posA.y -= ny * overlap * 0.5;
                    posB.x += nx * overlap * 0.5; posB.y += ny * overlap * 0.5;
                } else if (canMoveA) { posA.x -= nx * overlap; posA.y -= ny * overlap; }
                else if (canMoveB) { posB.x += nx * overlap; posB.y += ny * overlap; }

                const velA = A.components.Velocity; const velB = B.components.Velocity;
                if (velA && velB) {
                    const relativeVelX = velB.x - velA.x; const relativeVelY = velB.y - velA.y;
                    const velAlongNormal = relativeVelX * nx + relativeVelY * ny;
                    if (velAlongNormal < 0) {
                        const restitution = 0.8;
                        const massA = A.components.Mass?.value || 10; const massB = B.components.Mass?.value || 10;
                        let j = -(1 + restitution) * velAlongNormal; j /= 1 / massA + 1 / massB;
                        const impulseX = j * nx; const impulseY = j * ny;
                        if (canMoveA) { velA.x -= 1 / massA * impulseX; velA.y -= 1 / massA * impulseY; }
                        if (canMoveB) { velB.x += 1 / massB * impulseX; velB.y += 1 / massB * impulseY; }
                    }
                }
            }
        }
    }
};

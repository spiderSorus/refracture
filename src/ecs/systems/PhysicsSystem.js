// src/ecs/systems/PhysicsSystem.js
import { PHYSICS } from '../../core/Constants';
import Phaser from 'phaser';

export const PhysicsSystem = (entities, delta, scene) => {
    const dt = delta / 1000;
    const FLOOR_Y = 0;
    const GRAVITY = PHYSICS.GRAVITY || 980;
    
    // Independent gravity for floaters if specified by the scene
    const FLOATER_GRAVITY = scene?.floaterGravity !== undefined ? scene.floaterGravity : 0;

    const bounds = scene?.cameras.main.getBounds() || { x: -5000, y: -10000, width: 10000, height: 10000 };
    const minX = bounds.x;
    const maxX = bounds.x + bounds.width;
    const minY = bounds.y;
    const maxY = bounds.y + bounds.height;

    // --- 0. TRACK PLATFORMS CONNECTED TO EACH OTHER ---
    const connectedPlatformIds = new Set();
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            connectedPlatformIds.add(conn.fromId);
            connectedPlatformIds.add(conn.toId);
        }
        // NOTE: WebTether (Player->Platform) intentionally EXCLUDED here
    });

    // 1. RESOLVE WEB TENSION FORCES
    entities.forEach(entity => {
        // --- A. Active Tethers (Player -> Platform) ---
        const tether = entity.components.WebTether;
        const pPos = entity.components.Position;
        const pVel = entity.components.Velocity;
        const pMass = entity.components.Mass?.value || 1;

        if (tether && pPos && pVel) {
            const platform = entities.find(e => e.id === tether.platformId);
            if (platform && platform.components.Position) {
                const targetX = platform.components.Position.x + tether.anchorOffset.x;
                const targetY = platform.components.Position.y + tether.anchorOffset.y;
                
                const dx = targetX - pPos.x;
                const dy = targetY - pPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > tether.maxLength) {
                    const overlap = dist - tether.maxLength;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const force = overlap * tether.stiffness * 500;
                    tether.tension = force;

                    // Pull Player
                    pVel.x += (nx * force / pMass) * dt;
                    pVel.y += (ny * force / pMass) * dt;

                    // Pull Platform ONLY if it is dynamic (connected to another platform)
                    const platVel = platform.components.Velocity;
                    if (platVel && !platform.components.SpawnTag && connectedPlatformIds.has(platform.id)) {
                        const platMass = platform.components.Mass?.value || 10;
                        platVel.x -= (nx * force / platMass) * dt;
                        platVel.y -= (ny * force / platMass) * dt;
                    }
                } else {
                    tether.tension = 0;
                }
            }
        }

        // --- B. Static Connections (Platform A -> Platform B) ---
        const conn = entity.components.WebConnection;
        if (conn) {
            const entA = entities.find(e => e.id === conn.fromId);
            const entB = entities.find(e => e.id === conn.toId);
            if (entA && entB && entA.components.Position && entB.components.Position) {
                const ax = entA.components.Position.x + conn.fromOffset.x;
                const ay = entA.components.Position.y + conn.fromOffset.y;
                const bx = entB.components.Position.x + conn.toOffset.x;
                const by = entB.components.Position.y + conn.toOffset.y;

                const dx = bx - ax;
                const dy = by - ay;
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

                    // Connections ALWAYS apply force to both ends because they ARE the trigger for being dynamic
                    if (entA.components.Velocity && !entA.components.SpawnTag) {
                        entA.components.Velocity.x += (nx * force / massA) * dt;
                        entA.components.Velocity.y += (ny * force / massA) * dt;
                    }
                    if (entB.components.Velocity && !entB.components.SpawnTag) {
                        entB.components.Velocity.x -= (nx * force / massB) * dt;
                        entB.components.Velocity.y -= (ny * force / massB) * dt;
                    }
                } else {
                    conn.tension = 0;
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
                pos.x = platform.components.Position.x + parent.offset.x;
                pos.y = platform.components.Position.y + parent.offset.y;
            }
            if (vel) { vel.x = 0; vel.y = 0; }
            return;
        }

        if (vel) {
            const isPlayer = !!entity.components.PlayerTag;
            const isPlatform = !!entity.components.PlatformTag;
            const isSpawn = !!entity.components.SpawnTag;
            const isDynamic = connectedPlatformIds.has(entity.id);

            // GRAVITY RULES
            if (isPlayer) {
                vel.y += GRAVITY * dt;
            } else if (isPlatform && !isSpawn) {
                if (isDynamic) {
                    vel.y += FLOATER_GRAVITY * dt;
                } else {
                    // Force Static
                    vel.x = 0;
                    vel.y = 0;
                }
            } else if (!entity.components.GravityExempt) {
                vel.y += GRAVITY * dt;
            }

            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            // Player Floor Respawn
            if (isPlayer && pos.y >= FLOOR_Y) {
                const spawnPoint = entities.find(e => e.components.SpawnTag);
                if (spawnPoint && spawnPoint.components.Position) {
                    pos.x = spawnPoint.components.Position.x;
                    pos.y = spawnPoint.components.Position.y;
                    if (vel) { vel.x = 0; vel.y = 0; }
                    delete entity.components.Parent;
                    delete entity.components.WebTether;
                    const sling = entity.components.SlingshotJump;
                    if (sling) {
                        sling.canJump = true;
                        sling.lastPlatformId = null;
                        sling.isCharging = false;
                    }
                }
            }

            // Platform World Boundary Bouncing
            if (isPlatform && entity.components.Collider) {
                const col = entity.components.Collider;
                const radius = col.type === 'circle' ? col.radius : Math.max(col.width, col.height) / 2;
                const damping = 0.8;

                if (pos.x - radius < minX) {
                    pos.x = minX + radius;
                    vel.x = Math.abs(vel.x) * damping;
                } else if (pos.x + radius > maxX) {
                    pos.x = maxX - radius;
                    vel.x = -Math.abs(vel.x) * damping;
                }

                if (pos.y - radius < minY) {
                    pos.y = minY + radius;
                    vel.y = Math.abs(vel.y) * damping;
                } else if (pos.y + radius > maxY) {
                    pos.y = maxY - radius;
                    vel.y = -Math.abs(vel.y) * damping;
                }
            }
        }
    });

    // 3. RESOLVE PLATFORM-PLATFORM COLLISIONS
    const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider && e.components.Position);
    for (let i = 0; i < platforms.length; i++) {
        for (let j = i + 1; j < platforms.length; j++) {
            const A = platforms[i];
            const B = platforms[j];
            const posA = A.components.Position;
            const posB = B.components.Position;
            const colA = A.components.Collider;
            const colB = B.components.Collider;

            const levelA = A.components.RealityLevel?.interact || [0];
            const levelB = B.components.RealityLevel?.interact || [0];
            const canInteract = levelA.some(lvl => levelB.includes(lvl));
            if (!canInteract) continue;

            const dist = Phaser.Math.Distance.Between(posA.x, posA.y, posB.x, posB.y);
            const radiusA = colA.type === 'circle' ? colA.radius : Math.max(colA.width, colA.height) / 2;
            const radiusB = colB.type === 'circle' ? colB.radius : Math.max(colB.width, colB.height) / 2;
            const minDist = radiusA + radiusB;

            if (dist < minDist && dist > 0) {
                const overlap = minDist - dist;
                const nx = (posB.x - posA.x) / dist;
                const ny = (posB.y - posA.y) / dist;

                const canMoveA = !A.components.SpawnTag && connectedPlatformIds.has(A.id);
                const canMoveB = !B.components.SpawnTag && connectedPlatformIds.has(B.id);

                if (canMoveA && canMoveB) {
                    posA.x -= nx * overlap * 0.5;
                    posA.y -= ny * overlap * 0.5;
                    posB.x += nx * overlap * 0.5;
                    posB.y += ny * overlap * 0.5;
                } else if (canMoveA) {
                    posA.x -= nx * overlap;
                    posA.y -= ny * overlap;
                } else if (canMoveB) {
                    posB.x += nx * overlap;
                    posB.y += ny * overlap;
                }

                const velA = A.components.Velocity;
                const velB = B.components.Velocity;
                if (velA && velB) {
                    const relativeVelX = velB.x - velA.x;
                    const relativeVelY = velB.y - velA.y;
                    const velAlongNormal = relativeVelX * nx + relativeVelY * ny;

                    if (velAlongNormal < 0) {
                        const restitution = 0.8;
                        const massA = A.components.Mass?.value || 10;
                        const massB = B.components.Mass?.value || 10;
                        let j = -(1 + restitution) * velAlongNormal;
                        j /= 1 / massA + 1 / massB;

                        const impulseX = j * nx;
                        const impulseY = j * ny;

                        if (canMoveA) {
                            velA.x -= 1 / massA * impulseX;
                            velA.y -= 1 / massA * impulseY;
                        }
                        if (canMoveB) {
                            velB.x += 1 / massB * impulseX;
                            velB.y += 1 / massB * impulseY;
                        }
                    }
                }
            }
        }
    }
};

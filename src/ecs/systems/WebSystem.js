import Phaser from 'phaser';
import { WebTether, WebConnection } from '../components/index';
import { findPlayer } from '../entities/player';
import { snapOffsetInside, pointToSegmentDist } from '../../utils/CollisionUtils';
import { PHYSICS } from '../../core/Constants';

export const WebSystem = (entities, inputManager, scene) => {
    const player = findPlayer(entities);
    if (!player) return;

    const tether = player.components.WebTether;
    const currentParent = player.components.Parent;
    const pPos = player.components.Position;
    const pVel = player.components.Velocity;

    const MAX_SPOOL_LENGTH = PHYSICS.WEB_MAX_LENGTH;
    const MIN_SPOOL_LENGTH = PHYSICS.WEB_MIN_LENGTH;
    
    const strengthMult = PHYSICS.WEB_STRENGTH_MULT;

    // --- 0. WEB CUTTING LOGIC ---
    // ... (rest of cutting logic remains same)
    const xJustPressed = inputManager.isButtonPressed('X');
    let cutSomething = false;

    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = scene?.getEntityById(conn.fromId);
            const entB = scene?.getEntityById(conn.toId);

            if (entA && entB && entA.components.Position && entB.components.Position) {
                const rotA = entA.components.Rotation?.angle || 0;
                const rotB = entB.components.Rotation?.angle || 0;

                const ax = conn.fromOffset.x * Math.cos(rotA) - conn.fromOffset.y * Math.sin(rotA);
                const ay = conn.fromOffset.x * Math.sin(rotA) + conn.fromOffset.y * Math.cos(rotA);
                const bx = conn.toOffset.x * Math.cos(rotB) - conn.toOffset.y * Math.sin(rotB);
                const by = conn.toOffset.x * Math.sin(rotB) + conn.toOffset.y * Math.cos(rotB);

                const x1 = entA.components.Position.x + ax;
                const y1 = entA.components.Position.y + ay;
                const x2 = entB.components.Position.x + bx;
                const y2 = entB.components.Position.y + by;

                const distToWeb = pointToSegmentDist(pPos.x, pPos.y, x1, y1, x2, y2);
                
                conn.isCuttable = distToWeb < 30;

                if (xJustPressed && conn.isCuttable) {
                    console.log(`✂️ [WEB] Severed Connection: ${e.id}`);
                    e.toDestroy = true;
                    cutSomething = true;
                }
            }
        }
    });

    if (xJustPressed && tether && !cutSomething) {
        delete player.components.WebTether;
        delete player.components.Parent;
        return;
    }

    // --- 1. WINCH & DANGLE PHYSICS ---
    if (tether) {
        const platform = scene?.getEntityById(tether.platformId);
        if (platform && platform.components.Position) {
            const platRot = platform.components.Rotation?.angle || 0;
            const ax = tether.anchorOffset.x * Math.cos(platRot) - tether.anchorOffset.y * Math.sin(platRot);
            const ay = tether.anchorOffset.x * Math.sin(platRot) + tether.anchorOffset.y * Math.cos(platRot);
            
            const anchorX = platform.components.Position.x + ax;
            const anchorY = platform.components.Position.y + ay;

            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, anchorX, anchorY);
            tether.currentLength = dist;

            const lb = inputManager.isButtonDown('SHORTEN');
            const rb = inputManager.isButtonDown('LENGTHEN');
            const winchSpeed = PHYSICS.WEB_WINCH_SPEED;

            tether.isActive = false; 
            tether.isPullable = !!platform.components.SeesawTag;

            if (!currentParent && tether._hadParent) {
                tether.maxLength = tether.originalMaxLength || PHYSICS.WEB_INITIAL_LENGTH;
            }
            tether._hadParent = !!currentParent;

            if (lb) {
                tether.isActive = true;
                tether._wasLbDown = true;

                if (tether.maxLength > dist + 5) {
                    tether.maxLength = Math.max(dist, tether.maxLength - winchSpeed);
                } else {
                    tether.maxLength = dist;
                    
                    const isStandingOnTarget = currentParent && currentParent.id === tether.platformId;
                    if (tether.isPullable && !isStandingOnTarget && platform.components.SeesawTag && platform.components.AngularVelocity) {
                        const angVel = platform.components.AngularVelocity;
                        const cRot = platform.components.Rotation?.angle || 0;

                        // --- ADAPTIVE TUG DIRECTION ---
                        // Determine which rotation direction actually brings the anchor closer to the player
                        const testRot = 0.05;
                        
                        const getDistAtAngle = (angle) => {
                            const ax = tether.anchorOffset.x * Math.cos(angle) - tether.anchorOffset.y * Math.sin(angle);
                            const ay = tether.anchorOffset.x * Math.sin(angle) + tether.anchorOffset.y * Math.cos(angle);
                            const worldX = platform.components.Position.x + ax;
                            const worldY = platform.components.Position.y + ay;
                            return Phaser.Math.Distance.Between(pPos.x, pPos.y, worldX, worldY);
                        };

                        const distCW = getDistAtAngle(cRot + testRot);
                        const distCCW = getDistAtAngle(cRot - testRot);
                        
                        const direction = distCW < distCCW ? 1 : -1;
                        
                        // --- IMPROVED CONSTRAINT CHECK ---
                        let isBlocked = false;
                        entities.forEach(e => {
                            const conn = e.components.WebConnection;
                            if (conn && (conn.fromId === platform.id || conn.toId === platform.id)) {
                                const otherId = conn.fromId === platform.id ? conn.toId : conn.fromId;
                                const otherPlat = scene?.getEntityById(otherId);
                                if (otherPlat && otherPlat.components.Position) {
                                    const localOff = conn.fromId === platform.id ? conn.fromOffset : conn.toOffset;
                                    const otherOff = conn.fromId === platform.id ? conn.toOffset : conn.fromOffset;
                                    
                                    const cRot = platform.components.Rotation?.angle || 0;
                                    const oRot = otherPlat.components.Rotation?.angle || 0;
                                    
                                    // Look ahead just 0.01 radians
                                    const nextRot = cRot + (direction * 0.01);
                                    
                                    const nAx = localOff.x * Math.cos(nextRot) - localOff.y * Math.sin(nextRot);
                                    const nAy = localOff.x * Math.sin(nextRot) + localOff.y * Math.cos(nextRot);
                                    const curOx = otherOff.x * Math.cos(oRot) - otherOff.y * Math.sin(oRot);
                                    const curOy = otherOff.x * Math.sin(oRot) + otherOff.y * Math.cos(oRot);
                                    
                                    const nX1 = platform.components.Position.x + nAx;
                                    const nY1 = platform.components.Position.y + nAy;
                                    const curX2 = otherPlat.components.Position.x + curOx;
                                    const curY2 = otherPlat.components.Position.y + curOy;
                                    
                                    const nextDist = Phaser.Math.Distance.Between(nX1, nY1, curX2, curY2);
                                    
                                    // If rotation would exceed the rigid length, block it
                                    if (nextDist > conn.fixedLength + 1) {
                                        isBlocked = true;
                                    }
                                }
                            }
                        });

                        if (!isBlocked) {
                            const tiltForce = 2.0; 
                            angVel.rate += direction * tiltForce * (scene.game.loop.delta / 1000);
                            tether.isActive = true; // Signal active force to physics
                        } else {
                            angVel.rate = 0;
                            tether.isActive = false; // Blocked - allow physics to freeze it
                        }
                    }
                }
            } else {
                if (tether._wasLbDown) {
                    tether.maxLength = dist;
                    tether._wasLbDown = false;
                }
            }

            if (rb) {
                tether.maxLength = Math.min(MAX_SPOOL_LENGTH, tether.maxLength + winchSpeed);
                tether.originalMaxLength = tether.maxLength;
            }

            if (!currentParent && pVel && dist > tether.maxLength) {
                const nx = (pPos.x - anchorX) / dist;
                const ny = (pPos.y - anchorY) / dist;
                pPos.x = anchorX + (nx * tether.maxLength);
                pPos.y = anchorY + (ny * tether.maxLength);
                const outwardVel = (pVel.x * nx) + (pVel.y * ny);
                if (outwardVel > 0) {
                    pVel.x -= outwardVel * nx;
                    pVel.y -= outwardVel * ny;
                }
            }

            if (currentParent && currentParent.id === tether.platformId) {
                const dx = currentParent.offset.x - tether.anchorOffset.x;
                const dy = currentParent.offset.y - tether.anchorOffset.y;
                const localDist = Math.sqrt(dx * dx + dy * dy);

                if (localDist > tether.maxLength) {
                    const nx = dx / localDist;
                    const ny = dy / localDist;
                    currentParent.offset.x = tether.anchorOffset.x + (nx * tether.maxLength);
                    currentParent.offset.y = tether.anchorOffset.y + (ny * tether.maxLength);
                }
            }
        }
    }

    // --- 2. INPUT TRIGGERS ---
    const yJustPressed = inputManager.isButtonPressed('Y');

    // Case A: Create Tether
    if (yJustPressed && !tether) {
        // ONLY drop web if currently attached to an Anchor-tagged platform
        if (currentParent) {
            const plat = scene?.getEntityById(currentParent.id);
            const isBackground = (plat?.components.ZLayer?.type === 'BACKGROUND') || plat?.components.BackgroundTag;
            const isAnchor = !!plat?.components.AnchorTag;
            
            if (plat && plat.components.Position && !isBackground && isAnchor) {
                // Attach at current player position on the platform
                const snappedOffset = snapOffsetInside(currentParent.offset, plat.components.Collider, 10);
                const newTether = WebTether(currentParent.id, snappedOffset);
                newTether.maxForce *= strengthMult;
                newTether.isPullable = !!plat.components.SeesawTag;
                newTether.maxLength = PHYSICS.WEB_INITIAL_LENGTH; 
                newTether.originalMaxLength = PHYSICS.WEB_INITIAL_LENGTH;

                player.components.WebTether = newTether;
                console.log(`📍 [WEB] Dropped tether on anchor: ${plat.id}`);
                return;
            }
        }
    }

    if (yJustPressed && tether && !currentParent) {
        delete player.components.WebTether;
        return;
    }

    if (yJustPressed && tether && currentParent && tether.platformId !== currentParent.id) {
        const platA = scene?.getEntityById(tether.platformId);
        const platB = scene?.getEntityById(currentParent.id);
        const isBackA = (platA?.components.ZLayer?.type === 'BACKGROUND') || platA?.components.BackgroundTag;
        const isBackB = (platB?.components.ZLayer?.type === 'BACKGROUND') || platB?.components.BackgroundTag;
        const isAnchorA = !!platA?.components.AnchorTag;
        const isAnchorB = !!platB?.components.AnchorTag;
        
        if (platA && platB && platA.components.Position && platB.components.Position && !isBackA && !isBackB && isAnchorA && isAnchorB) {
            const snappedOffsetB = snapOffsetInside(currentParent.offset, platB.components.Collider, 10);
            
            const conn = WebConnection(
                tether.platformId, { ...tether.anchorOffset }, 
                currentParent.id, snappedOffsetB
            );
            conn.maxForce *= strengthMult;

            // Calculate actual distance for fixedLength
            const rotA = platA.components.Rotation?.angle || 0;
            const rotB = platB.components.Rotation?.angle || 0;
            const ax = tether.anchorOffset.x * Math.cos(rotA) - tether.anchorOffset.y * Math.sin(rotA);
            const ay = tether.anchorOffset.x * Math.sin(rotA) + tether.anchorOffset.y * Math.cos(rotA);
            const bx = snappedOffsetB.x * Math.cos(rotB) - snappedOffsetB.y * Math.sin(rotB);
            const by = snappedOffsetB.x * Math.sin(rotB) + snappedOffsetB.y * Math.cos(rotB);
            
            const worldAX = platA.components.Position.x + ax;
            const worldAY = platA.components.Position.y + ay;
            const worldBX = platB.components.Position.x + bx;
            const worldBY = platB.components.Position.y + by;
            
            const curDist = Phaser.Math.Distance.Between(worldAX, worldAY, worldBX, worldBY);

            // Add slack (10%) if neither is a seesaw
            const hasSeesaw = platA.components.SeesawTag || platB.components.SeesawTag;
            conn.fixedLength = hasSeesaw ? curDist : curDist * 1.1; 
            
            entities.push({
                id: crypto.randomUUID(),
                components: { WebConnection: conn }
            });
        }
        delete player.components.WebTether;
    }

    if (tether && tether.tension > tether.maxForce) {
        delete player.components.WebTether;
        delete player.components.Parent;
    }

    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn && conn.tension > conn.maxForce) {
            e.toDestroy = true;
        }
    });
};

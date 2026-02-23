import Phaser from 'phaser';
import { WebTether, WebConnection } from '../components/index';
import { findPlayer } from '../entities/player';
import { snapOffsetInside } from '../../utils/CollisionUtils';

export const WebSystem = (entities, inputManager) => {
    const player = findPlayer(entities);
    if (!player) return;

    const tether = player.components.WebTether;
    const currentParent = player.components.Parent;
    const pPos = player.components.Position;
    const pVel = player.components.Velocity;
    const currentLevel = player.components.MeditationState?.currentLevel || 0;

    const MAX_SPOOL_LENGTH = 1000;
    const MIN_SPOOL_LENGTH = 10;

    // --- 1. WINCH & DANGLE PHYSICS ---
    if (tether) {
        const platform = entities.find(e => e.id === tether.platformId);
        // Interaction Check for Physics
        const canInteract = platform && (platform.components.RealityLevel ? platform.components.RealityLevel.interact.includes(currentLevel) : currentLevel === 0);

        if (platform && platform.components.Position && canInteract) {
            const anchorX = platform.components.Position.x + tether.anchorOffset.x;
            const anchorY = platform.components.Position.y + tether.anchorOffset.y;

            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, anchorX, anchorY);
            tether.currentLength = dist;

            const lb = inputManager.isButtonDown('SHORTEN');
            const rb = inputManager.isButtonDown('LENGTHEN');
            const winchSpeed = 4;

            if (lb) tether.maxLength = Math.max(MIN_SPOOL_LENGTH, tether.maxLength - winchSpeed);
            if (rb) tether.maxLength = Math.min(MAX_SPOOL_LENGTH, tether.maxLength + winchSpeed);

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

            // --- NEW: ON-PLATFORM CONSTRAINT ---
            // If we are WALKING on the platform we are tethered to, 
            // don't let our offset exceed the tether length.
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
    const xJustPressed = inputManager.isButtonPressed('X');
    const yJustPressed = inputManager.isButtonPressed('Y');

    // CREATE TETHER (Y button only)
    if (yJustPressed && !tether && currentParent) {
        const plat = entities.find(e => e.id === currentParent.id);
        // No extra check needed as currentParent implies we already passed attachment interaction check
        if (plat && plat.components.Position) {
            const snappedOffset = snapOffsetInside(currentParent.offset, plat.components.Collider, 10);
            player.components.WebTether = WebTether(currentParent.id, snappedOffset);
            player.components.WebTether.maxLength = MAX_SPOOL_LENGTH; 
            return;
        }
    }

    // CUT TETHER (X button only)
    if (xJustPressed && tether) {
        delete player.components.WebTether;
        return;
    }

    // CONNECT (Y Button): Capture Fixed Slack Length
    if (yJustPressed && tether && currentParent && tether.platformId !== currentParent.id) {
        const exists = entities.some(e => {
            const c = e.components.WebConnection;
            return c && ((c.fromId === tether.platformId && c.toId === currentParent.id) || (c.fromId === currentParent.id && c.toId === tether.platformId));
        });

        if (!exists) {
            const platA = entities.find(e => e.id === tether.platformId);
            const platB = entities.find(e => e.id === currentParent.id);
            
            if (platA && platB && platA.components.Position && platB.components.Position) {
                // Determine if both platforms are currently interactive
                const canA = platA.components.RealityLevel ? platA.components.RealityLevel.interact.includes(currentLevel) : currentLevel === 0;
                const canB = platB.components.RealityLevel ? platB.components.RealityLevel.interact.includes(currentLevel) : currentLevel === 0;

                if (canA && canB) {
                    const snappedOffsetB = snapOffsetInside(currentParent.offset, platB.components.Collider, 10);

                    const x1 = platA.components.Position.x + tether.anchorOffset.x;
                    const y1 = platA.components.Position.y + tether.anchorOffset.y;
                    const x2 = platB.components.Position.x + snappedOffsetB.x;
                    const y2 = platB.components.Position.y + snappedOffsetB.y;
                    
                    const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
                    const conn = WebConnection(
                        tether.platformId, { ...tether.anchorOffset }, 
                        currentParent.id, snappedOffsetB
                    );
                    
                    conn.fixedLength = dist * 1.15;
                    
                    entities.push({
                        id: crypto.randomUUID(),
                        components: { 
                            WebConnection: conn
                        }
                    });
                }
            }
        }
        delete player.components.WebTether;
    }

    // --- 3. BREAKING LOGIC ---
    if (tether && tether.tension > tether.maxForce) {
        console.log("💥 Tether Snap!");
        delete player.components.WebTether;
    }

    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn && conn.tension > conn.maxForce) {
            console.log("💥 Web Connection Snap!");
            e.toDestroy = true; // Handled by BaseTestScene cleanup
        }
    });
};

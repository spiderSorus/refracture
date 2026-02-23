import Phaser from 'phaser';
import { WebTether, WebConnection, WebTag, PlatformTag, Collider } from '../components/index';
import { findPlayer } from '../entities/player';
import { snapOffsetInside } from '../../utils/CollisionUtils';
import { getAnchorWorldPos } from '../../utils/WebUtils';

export const WebSystem = (entities, inputManager) => {
    const player = findPlayer(entities);
    if (!player) return;

    const tether = player.components.WebTether;
    const currentParent = player.components.Parent;
    const pPos = player.components.Position;
    const pVel = player.components.Velocity;

    const MAX_SPOOL_LENGTH = 1000;
    const MIN_SPOOL_LENGTH = 10;

    // --- 1. WINCH & DANGLE PHYSICS ---
    if (tether) {
        const anchor = getAnchorWorldPos(entities, tether.platformId, tether.anchorOffset);
        if (anchor) {
            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, anchor.x, anchor.y);
            tether.currentLength = dist;

            const lb = inputManager.isButtonDown('SHORTEN');
            const rb = inputManager.isButtonDown('LENGTHEN');
            const winchSpeed = 4;

            if (lb) tether.maxLength = Math.max(MIN_SPOOL_LENGTH, tether.maxLength - winchSpeed);
            if (rb) tether.maxLength = Math.min(MAX_SPOOL_LENGTH, tether.maxLength + winchSpeed);

            if (!currentParent && pVel && dist > tether.maxLength) {
                const nx = (pPos.x - anchor.x) / dist;
                const ny = (pPos.y - anchor.y) / dist;
                pPos.x = anchor.x + (nx * tether.maxLength);
                pPos.y = anchor.y + (ny * tether.maxLength);
                const outwardVel = (pVel.x * nx) + (pVel.y * ny);
                if (outwardVel > 0) {
                    pVel.x -= outwardVel * nx;
                    pVel.y -= outwardVel * ny;
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
        if (plat) {
            let anchorOffset;
            if (currentParent.isWeb) {
                anchorOffset = { x: 0, y: 0 };
            } else {
                anchorOffset = snapOffsetInside(currentParent.offset, plat.components.Collider, 10);
            }
            
            player.components.WebTether = WebTether(currentParent.id, anchorOffset);
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
            const platB = entities.find(e => e.id === currentParent.id);
            if (platB) {
                const p1 = getAnchorWorldPos(entities, tether.platformId, tether.anchorOffset);
                
                let snappedOffsetB;
                let p2;

                if (currentParent.isWeb) {
                    snappedOffsetB = { x: 0, y: 0 };
                    p2 = getAnchorWorldPos(entities, currentParent.id, snappedOffsetB);
                } else {
                    snappedOffsetB = snapOffsetInside(currentParent.offset, platB.components.Collider, 10);
                    p2 = {
                        x: platB.components.Position.x + snappedOffsetB.x,
                        y: platB.components.Position.y + snappedOffsetB.y
                    };
                }
                
                if (p1 && p2) {
                    const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
                    const conn = WebConnection(
                        tether.platformId, { ...tether.anchorOffset }, 
                        currentParent.id, snappedOffsetB
                    );
                    
                    conn.fixedLength = dist * 1.15;
                    
                    entities.push({
                        id: crypto.randomUUID(),
                        components: { 
                            WebConnection: conn,
                            WebTag: WebTag(),
                            PlatformTag: PlatformTag(),
                            Collider: Collider('web')
                        }
                    });
                }
            }
        }
        delete player.components.WebTether;
    }
};

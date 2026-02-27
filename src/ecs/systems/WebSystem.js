import Phaser from 'phaser';
import { WebTether, WebConnection } from '../components/index';
import { findPlayer } from '../entities/player';
import { snapOffsetInside } from '../../utils/CollisionUtils';
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

    // --- 1. WINCH & DANGLE PHYSICS ---
    if (tether) {
        const platform = entities.find(e => e.id === tether.platformId);
        if (platform && platform.components.Position) {
            const anchorX = platform.components.Position.x + tether.anchorOffset.x;
            const anchorY = platform.components.Position.y + tether.anchorOffset.y;

            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, anchorX, anchorY);
            tether.currentLength = dist;

            const lb = inputManager.isButtonDown('SHORTEN');
            const rb = inputManager.isButtonDown('LENGTHEN');
            const winchSpeed = PHYSICS.WEB_WINCH_SPEED;

            // Only allow winching if NOT attached to a different platform
            const canWinch = !currentParent || currentParent.id === tether.platformId;

            if (canWinch) {
                if (lb) tether.maxLength = Math.max(MIN_SPOOL_LENGTH, tether.maxLength - winchSpeed);
                if (rb) tether.maxLength = Math.min(MAX_SPOOL_LENGTH, tether.maxLength + winchSpeed);
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
    const xJustPressed = inputManager.isButtonPressed('X');
    const yJustPressed = inputManager.isButtonPressed('Y');

    // CREATE TETHER
    if (yJustPressed && !tether && currentParent) {
        const plat = entities.find(e => e.id === currentParent.id);
        const isBackground = (plat?.components.ZLayer?.type === 'BACKGROUND') || plat?.components.BackgroundTag;
        
        if (plat && plat.components.Position && !isBackground) {
            const snappedOffset = snapOffsetInside(currentParent.offset, plat.components.Collider, 10);
            const newTether = WebTether(currentParent.id, snappedOffset);
            newTether.maxForce *= strengthMult;
            player.components.WebTether = newTether;
            player.components.WebTether.maxLength = PHYSICS.WEB_INITIAL_LENGTH; 
            return;
        }
    }

    if (yJustPressed && tether && !currentParent) {
        delete player.components.WebTether;
        return;
    }

    if (xJustPressed && tether) {
        delete player.components.WebTether;
        delete player.components.Parent;
        return;
    }

    // CONNECT
    if (yJustPressed && tether && currentParent && tether.platformId !== currentParent.id) {
        const platA = entities.find(e => e.id === tether.platformId);
        const platB = entities.find(e => e.id === currentParent.id);
        
        const isBackA = (platA?.components.ZLayer?.type === 'BACKGROUND') || platA?.components.BackgroundTag;
        const isBackB = (platB?.components.ZLayer?.type === 'BACKGROUND') || platB?.components.BackgroundTag;
        
        if (platA && platB && platA.components.Position && platB.components.Position && !isBackA && !isBackB) {
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
            
            conn.maxForce *= strengthMult;
            conn.fixedLength = dist * 1.15;
            
            console.log(`🔗 [WEB] Created Connection: ${tether.platformId} <-> ${currentParent.id}`);

            entities.push({
                id: crypto.randomUUID(),
                components: { WebConnection: conn }
            });
        }
        delete player.components.WebTether;
    }

    // --- 3. BREAKING LOGIC ---
    if (tether && tether.tension > tether.maxForce) {
        console.log("💥 Tether Snap!");
        delete player.components.WebTether;
        delete player.components.Parent;
    }

    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn && conn.tension > conn.maxForce) {
            console.log("💥 Web Connection Snap!");
            e.toDestroy = true;
        }
    });
};

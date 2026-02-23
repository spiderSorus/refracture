// src/ecs/systems/WebSystem.js
import Phaser from 'phaser';
import { WebTether, WebConnection, Parent } from '../components/index';

export const WebSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;

    const tether = player.components.WebTether;
    const currentParent = player.components.Parent;
    const pPos = player.components.Position;
    const pVel = player.components.Velocity;

    const MAX_SPOOL_LENGTH = 1000;
    const MIN_SPOOL_LENGTH = 10;

    if (tether) {
        const plat = entities.find(e => e.id === tether.platformId);
        if (plat && plat.components.Position) {
            const anchorX = plat.components.Position.x + tether.anchorOffset.x;
            const anchorY = plat.components.Position.y + tether.anchorOffset.y;

            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, anchorX, anchorY);
            tether.currentLength = dist;

            const lb = inputManager.isButtonDown('SHORTEN');
            const rb = inputManager.isButtonDown('LENGTHEN');
            const winchSpeed = 4;

            if (lb) tether.maxLength = Math.max(MIN_SPOOL_LENGTH, tether.maxLength - winchSpeed);
            if (rb) tether.maxLength = Math.min(MAX_SPOOL_LENGTH, tether.maxLength + winchSpeed);

            if (currentParent) {
                const dx = currentParent.offset.x - tether.anchorOffset.x;
                const dy = currentParent.offset.y - tether.anchorOffset.y;
                const offsetDist = Math.sqrt(dx * dx + dy * dy);

                if (offsetDist > tether.maxLength) {
                    const diff = offsetDist - tether.maxLength;
                    const dirX = dx / offsetDist;
                    const dirY = dy / offsetDist;
                    currentParent.offset.x -= dirX * diff;
                    currentParent.offset.y -= dirY * diff;
                }
            }
            // PURE ROPE PHYSICS (No Dampening)
            else if (!currentParent && pVel) {
                if (dist > tether.maxLength) {
                    const nx = (pPos.x - anchorX) / dist;
                    const ny = (pPos.y - anchorY) / dist;

                    // Hard constraint: snap to edge
                    pPos.x = anchorX + (nx * tether.maxLength);
                    pPos.y = anchorY + (ny * tether.maxLength);

                    // Cancel ONLY the velocity pushing outward against the rope
                    const outwardVel = (pVel.x * nx) + (pVel.y * ny);
                    if (outwardVel > 0) {
                        pVel.x -= outwardVel * nx;
                        pVel.y -= outwardVel * ny;
                    }
                    // NO artificial friction applied here. Gravity and momentum rule.
                }
            }
        }
    }

    const xJustPressed = inputManager.isButtonPressed('X');
    const yJustPressed = inputManager.isButtonPressed('Y');

    if ((xJustPressed || yJustPressed) && !tether && currentParent) {
        const dx = currentParent.offset.x;
        const dy = currentParent.offset.y;
        let initialDist = Math.sqrt(dx * dx + dy * dy);
        initialDist = Phaser.Math.Clamp(initialDist, MIN_SPOOL_LENGTH, MAX_SPOOL_LENGTH);

        player.components.WebTether = WebTether(currentParent.id, { x: 0, y: 0 });
        player.components.WebTether.maxLength = initialDist;
        player.components.WebTether.currentLength = initialDist;
        return;
    }

    if (xJustPressed && tether) {
        delete player.components.WebTether;
        return;
    }

    if (yJustPressed && tether && currentParent && tether.platformId !== currentParent.id) {
        const exists = entities.some(e => {
            const c = e.components.WebConnection;
            return c && (
                (c.fromId === tether.platformId && c.toId === currentParent.id) ||
                (c.fromId === currentParent.id && c.toId === tether.platformId)
            );
        });

        if (!exists) {
            entities.push({
                id: crypto.randomUUID(),
                components: {
                    WebConnection: WebConnection(
                        tether.platformId,
                        { ...tether.anchorOffset },
                        currentParent.id,
                        { x: 0, y: 0 }
                    )
                }
            });
        }
        delete player.components.WebTether;
    }

    if (xJustPressed && !tether && !currentParent) {
        const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);
        const target = platforms.find(plat => {
            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, plat.components.Position.x, plat.components.Position.y);
            return dist <= (plat.components.Collider.radius || 50) + 20;
        });
        if (target) {
            player.components.Parent = Parent(target.id, {
                x: pPos.x - target.components.Position.x,
                y: pPos.y - target.components.Position.y
            });
        }
    }
};
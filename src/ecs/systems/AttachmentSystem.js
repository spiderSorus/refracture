// src/ecs/systems/AttachmentSystem.js
import { isPointInside } from '../../utils/CollisionUtils';
import { findPlayer } from '../entities/player';

/**
 * AttachmentSystem
 * Handles immediate snapping of the player to platforms upon overlap.
 */
export const AttachmentSystem = (entities) => {
    const player = findPlayer(entities);
    if (!player || player.components.Parent) return;

    const pPos = player.components.Position;
    const sling = player.components.SlingshotJump;

    const platforms = entities.filter(e => {
        const isPlatform = e.components.PlatformTag && e.components.Collider && e.components.Position;
        const zLayer = e.components.ZLayer;
        // Never interact with background layers
        const isBackground = zLayer && zLayer.type === 'BACK';
        return isPlatform && !isBackground;
    });
    const catchBuffer = 15;

    if (sling && sling.lastPlatformId) {
        const lastPlat = entities.find(e => e.id === sling.lastPlatformId);
        if (lastPlat && lastPlat.components.Position) {
            const isStillInside = isPointInside(pPos, lastPlat.components.Position, lastPlat.components.Collider, catchBuffer + 10);
            if (!isStillInside) {
                sling.lastPlatformId = null;
            }
        } else {
            sling.lastPlatformId = null;
        }
    }

    for (const plat of platforms) {
        if (sling && sling.lastPlatformId === plat.id) continue;

        if (isPointInside(pPos, plat.components.Position, plat.components.Collider, catchBuffer)) {
            // --- ROTATION-AWARE ATTACHMENT ---
            // We need to calculate the local offset by rotating the world delta into local space
            const platRot = plat.components.Rotation?.angle || 0;
            const dx = pPos.x - plat.components.Position.x;
            const dy = pPos.y - plat.components.Position.y;
            
            // Rotate by NEGATIVE platform rotation to get local offset
            const cos = Math.cos(-platRot);
            const sin = Math.sin(-platRot);
            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;

            player.components.Parent = {
                _type: 'Parent',
                id: plat.id,
                offset: {
                    x: localX,
                    y: localY
                }
            };

            if (player.components.Velocity) {
                player.components.Velocity.x = 0;
                player.components.Velocity.y = 0;
            }

            if (sling) {
                sling.canJump = true;
                sling.isCharging = false;
            }

            console.log(`[ATTACH] Immediate Snap to: ${plat.id}`);
            return;
        }
    }
};

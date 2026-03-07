// src/ecs/systems/AttachmentSystem.js
import { isPointInside, snapOffsetInside } from '../../utils/CollisionUtils';
import { findPlayer } from '../entities/player';

/**
 * AttachmentSystem
 * Handles immediate snapping of the player to platforms upon overlap.
 */
export const AttachmentSystem = (entities, scene) => {
    const player = findPlayer(entities);
    if (!player || player.components.Parent) return;

    const pPos = player.components.Position;
    const sling = player.components.SlingshotJump;

    const platforms = entities.filter(e => {
        const isPlatform = e.components.PlatformTag && e.components.Collider && e.components.Position;
        const zLayer = e.components.ZLayer;
        // Never interact with background layers or BackgroundTag entities
        const isBackground = (zLayer && zLayer.type === 'BACKGROUND') || e.components.BackgroundTag;
        return isPlatform && !isBackground;
    });
    const catchBuffer = 15;

    if (sling && (sling.lastPlatformId || sling.isJumping)) {
        const lastId = sling.lastPlatformId;
        if (lastId) {
            const lastPlat = scene?.getEntityById(lastId);
            if (lastPlat && lastPlat.components.Position) {
                const rot = lastPlat.components.Rotation?.angle || 0;
                // Larger buffer to ensure they've really left before we clear the jump state/ID
                const isStillInside = isPointInside(pPos, lastPlat.components.Position, lastPlat.components.Collider, catchBuffer + 10, rot);
                if (!isStillInside) {
                    sling.lastPlatformId = null;
                    sling.isJumping = false; // They've left the starting platform
                }
            } else {
                sling.lastPlatformId = null;
                sling.isJumping = false;
            }
        }
    }

    for (const plat of platforms) {
        // Cannot re-attach to the one we just jumped from until we clear it
        if (sling && (sling.lastPlatformId === plat.id || (sling.isJumping && sling.lastPlatformId === plat.id))) continue;

        const platRot = plat.components.Rotation?.angle || 0;
        if (isPointInside(pPos, plat.components.Position, plat.components.Collider, catchBuffer, platRot)) {
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

            const pRadius = player.components.Collider?.radius || 0;
            const snapped = snapOffsetInside({ x: localX, y: localY }, plat.components.Collider, pRadius);

            player.components.Parent = {
                _type: 'Parent',
                id: plat.id,
                offset: snapped
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

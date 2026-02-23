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

    // 1. Hard Floor check (Logical Floor is 0)
    if (pPos.y >= -2) {
        if (sling) {
            sling.canJump = true;
            sling.lastPlatformId = null;
        }
        return;
    }

    const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider && e.components.Position);
    const catchBuffer = 15;

    // --- 1.5 CLEAR LAST PLATFORM ID WHEN WE LEAVE ITS BOUNDS ---
    if (sling && sling.lastPlatformId) {
        const lastPlat = entities.find(e => e.id === sling.lastPlatformId);
        if (lastPlat && lastPlat.components.Position) {
            // Check if we are outside the last platform (+ generous buffer)
            const isStillInside = isPointInside(pPos, lastPlat.components.Position, lastPlat.components.Collider, catchBuffer + 10);
            if (!isStillInside) {
                sling.lastPlatformId = null;
            }
        } else {
            // Platform no longer exists
            sling.lastPlatformId = null;
        }
    }

    // 2. Collision Detection Pass (Immediate Attachment)
    for (const plat of platforms) {
        // PREVENT IMMEDIATE RE-ATTACHMENT: 
        // If we just jumped from this platform, don't re-snap until we leave it.
        if (sling && sling.lastPlatformId === plat.id) {
            continue;
        }

        if (isPointInside(pPos, plat.components.Position, plat.components.Collider, catchBuffer)) {
            player.components.Parent = {
                _type: 'Parent',
                id: plat.id,
                offset: {
                    x: pPos.x - plat.components.Position.x,
                    y: pPos.y - plat.components.Position.y
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

// src/ecs/systems/AttachmentSystem.js
import { isPointInside } from '../../utils/CollisionUtils';
import { findPlayer } from '../entities/player';
import { getAnchorWorldPos } from '../../utils/WebUtils';

/**
 * AttachmentSystem
 * Handles immediate snapping of the player to platforms or webs upon overlap.
 */
export const AttachmentSystem = (entities) => {
    const player = findPlayer(entities);
    // If no player or already attached, we don't need to check for new attachments
    if (!player || player.components.Parent) return;

    const pPos = player.components.Position;
    const sling = player.components.SlingshotJump;

    // --- 0. SYNC WEB COLLIDER DATA ---
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        const col = e.components.Collider;
        if (conn && col && col.type === 'web') {
            const p1 = getAnchorWorldPos(entities, conn.fromId, conn.fromOffset);
            const p2 = getAnchorWorldPos(entities, conn.toId, conn.toOffset);
            if (p1 && p2) {
                col.webData = {
                    x1: p1.x,
                    y1: p1.y,
                    x2: p2.x,
                    y2: p2.y
                };
            }
        }
    });

    // 1. Hard Floor check (Logical Floor is 0)
    // If on ground, we are technically "attached" to the floor, so we don't look for platforms.
    if (pPos.y >= -2) {
        if (sling) {
            sling.canJump = true;
            sling.lastPlatformId = null;
        }
        return;
    }

    const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);
    const catchBuffer = 15;

    // 2. Collision Detection Pass (Immediate Attachment)
    for (const plat of platforms) {
        if (isPointInside(pPos, plat.components.Position || { x: 0, y: 0 }, plat.components.Collider, catchBuffer)) {
            const isWeb = !!plat.components.WebTag;

            player.components.Parent = {
                _type: 'Parent',
                id: plat.id,
                isWeb: isWeb,
                offset: {
                    x: pPos.x - (plat.components.Position?.x || 0),
                    y: pPos.y - (plat.components.Position?.y || 0)
                }
            };

            // Kill momentum upon attachment
            if (player.components.Velocity) {
                player.components.Velocity.x = 0;
                player.components.Velocity.y = 0;
            }

            // Reset Slingshot State
            if (sling) {
                sling.canJump = true;
                sling.isCharging = false;
            }

            console.log(`[ATTACH] Immediate Snap to: ${plat.id} (Web: ${isWeb})`);
            return; // Attached, stop searching
        }
    }
};

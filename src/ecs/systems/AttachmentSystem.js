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
    const currentLevel = player.components.MeditationState?.currentLevel || 0;

    // 1. Hard Floor check (Logical Floor is 0)
    if (pPos.y >= -2) {
        if (sling) {
            sling.canJump = true;
            sling.lastPlatformId = null;
        }
        return;
    }

    // Filter for physical platforms only + INTERACTION CHECK
    const platforms = entities.filter(e => {
        const { PlatformTag: plat, Collider: col, Position: pos, RealityLevel: reality } = e.components;
        if (!plat || !col || !pos) return false;
        
        // Interaction Check: Current level must be in the 'interact' array
        return reality ? reality.interact.includes(currentLevel) : (currentLevel === 0);
    });

    const catchBuffer = 15;

    // --- 1.5 CLEAR LAST PLATFORM ID WHEN WE LEAVE ITS BOUNDS ---
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

    // 2. Collision Detection Pass (Immediate Attachment)
    for (const plat of platforms) {
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

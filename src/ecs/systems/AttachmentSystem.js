// src/ecs/systems/AttachmentSystem.js
import Phaser from 'phaser';

/**
 * AttachmentSystem
 * Handles the 2-frame dwell logic for snapping the player to platforms.
 * Works in tandem with SlingshotSystem's raycast exit to allow re-attachment.
 */
export const AttachmentSystem = (entities) => {
    const player = entities.find(e => e.components.PlayerTag);
    // If no player or already attached, we don't need to check for new attachments
    if (!player || player.components.Parent) return;

    const pPos = player.components.Position;
    const sling = player.components.SlingshotJump;

    // 1. Hard Floor check (Logical Floor is 0)
    // If the player is on the ground, reset the dwell timer
    if (pPos.y >= -2) {
        if (sling) {
            sling.dwellFrames = 0;
            sling.potentialPlatformId = null;
        }
        return;
    }

    const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);
    const catchBuffer = 15; // Extra padding to make grabbing feel "generous"
    let currentlyOverId = null;

    // 2. Collision Detection Pass
    for (const plat of platforms) {
        // NOTE: lastPlatformId check removed to allow re-attachment to the same platform

        const platPos = plat.components.Position;
        const col = plat.components.Collider;
        let isInside = false;

        // Circle Collider Logic
        if (col.type === 'circle') {
            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, platPos.x, platPos.y);
            isInside = dist <= (col.radius + catchBuffer);
        }
        // Rectangle/Box Collider Logic
        else {
            const hw = (col.width / 2) + catchBuffer;
            const hh = (col.height / 2) + catchBuffer;
            isInside = (
                pPos.x >= platPos.x - hw && pPos.x <= platPos.x + hw &&
                pPos.y >= platPos.y - hh && pPos.y <= platPos.y + hh
            );
        }

        if (isInside) {
            currentlyOverId = plat.id;
            break; // Found a platform, stop looking
        }
    }

    // 3. The 2-Frame Dwell Verification
    // This prevents "flicker" attachments and ensures the player intended to land
    if (currentlyOverId) {
        if (sling.potentialPlatformId === currentlyOverId) {
            sling.dwellFrames++;
        } else {
            // First frame overlapping this specific platform
            sling.potentialPlatformId = currentlyOverId;
            sling.dwellFrames = 1;
        }

        // Trigger the "Snap" on the second consistent frame
        if (sling.dwellFrames >= 2) {
            const plat = entities.find(e => e.id === currentlyOverId);

            // Create the Parent component to lock the player to the platform
            player.components.Parent = {
                _type: 'Parent',
                id: currentlyOverId,
                // Store relative distance so the player stays at the same spot on the platform
                offset: {
                    x: pPos.x - plat.components.Position.x,
                    y: pPos.y - plat.components.Position.y
                }
            };

            // Kill momentum upon attachment
            if (player.components.Velocity) {
                player.components.Velocity.x = 0;
                player.components.Velocity.y = 0;
            }

            // Reset Slingshot State for a new jump
            sling.canJump = true;
            sling.dwellFrames = 0;
            sling.potentialPlatformId = null;

            console.log(`[ATTACH] Snapped to Platform: ${currentlyOverId}`);
        }
    } else {
        // Not overlapping any platform; clear the dwell progress
        if (sling) {
            sling.dwellFrames = 0;
            sling.potentialPlatformId = null;
        }
    }
};
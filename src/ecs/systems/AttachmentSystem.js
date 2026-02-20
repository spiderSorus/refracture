// src/ecs/systems/AttachmentSystem.js
import Phaser from 'phaser';

export const AttachmentSystem = (entities) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player || player.components.Parent) return;

    const pPos = player.components.Position;
    const sling = player.components.SlingshotJump;

    // Hard Floor check (Logical Floor is 0)
    if (pPos.y >= -2) {
        if (sling) {
            sling.dwellFrames = 0;
            sling.potentialPlatformId = null;
        }
        return;
    }

    const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);
    const catchBuffer = 15;
    let currentlyOverId = null;

    // 1. Check for area overlap
    for (const plat of platforms) {
        if (sling && sling.lastPlatformId === plat.id) continue;

        const platPos = plat.components.Position;
        const col = plat.components.Collider;
        let isInside = false;

        if (col.type === 'circle') {
            isInside = Phaser.Math.Distance.Between(pPos.x, pPos.y, platPos.x, platPos.y) <= (col.radius + catchBuffer);
        } else {
            const hw = (col.width / 2) + catchBuffer;
            const hh = (col.height / 2) + catchBuffer;
            isInside = (pPos.x >= platPos.x - hw && pPos.x <= platPos.x + hw &&
                pPos.y >= platPos.y - hh && pPos.y <= platPos.y + hh);
        }

        if (isInside) {
            currentlyOverId = plat.id;
            break;
        }
    }

    // 2. The 2-Frame Verification
    if (currentlyOverId) {
        if (sling.potentialPlatformId === currentlyOverId) {
            sling.dwellFrames++;
        } else {
            sling.potentialPlatformId = currentlyOverId;
            sling.dwellFrames = 1;
        }

        // Trigger snap on frame 2
        if (sling.dwellFrames >= 2) {
            const plat = entities.find(e => e.id === currentlyOverId);

            player.components.Parent = {
                _type: 'Parent',
                id: currentlyOverId,
                offset: { x: pPos.x - plat.components.Position.x, y: pPos.y - plat.components.Position.y }
            };

            if (player.components.Velocity) {
                player.components.Velocity.x = 0;
                player.components.Velocity.y = 0;
            }

            sling.lastPlatformId = null;
            sling.canJump = true;
            sling.dwellFrames = 0;
            sling.potentialPlatformId = null;
        }
    } else {
        sling.dwellFrames = 0;
        sling.potentialPlatformId = null;
    }
};
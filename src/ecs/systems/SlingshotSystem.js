// src/ecs/systems/SlingshotSystem.js
import { RaycastPlatformSystem } from './RaycastPlatformSystem';

export const SlingshotSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    const vel = player.components.Velocity;
    const parent = player.components.Parent;
    const pos = player.components.Position;

    const stick = inputManager.getRightStickRaw();
    const mag = Math.sqrt(stick.x * stick.x + stick.y * stick.y);

    const ARM_THRESHOLD = 0.5;
    const RELEASE_THRESHOLD = 0.25;

    if (mag >= ARM_THRESHOLD) {
        if (!sling.isCharging && (parent || (pos && pos.y >= 0))) {
            sling.isCharging = true;
        }
        if (sling.isCharging) {
            sling.lockedAim = { x: stick.x / mag, y: stick.y / mag };
        }
    }
    else if (sling.isCharging && mag < RELEASE_THRESHOLD) {
        if (sling.lockedAim) {
            const launchDir = { x: -sling.lockedAim.x, y: -sling.lockedAim.y };

            if (parent) {
                // Use Raytracing to find the edge of the current platform
                const hit = RaycastPlatformSystem.findTarget(entities, pos, launchDir, 500);
                if (hit && hit.entity.id === parent.id) {
                    // Projection: Move to edge + 10px buffer
                    pos.x = hit.point.x + (launchDir.x * 10);
                    pos.y = hit.point.y + (launchDir.y * 10);
                }
                delete player.components.Parent;
            }

            if (vel) {
                vel.x = launchDir.x * sling.maxForce;
                vel.y = launchDir.y * sling.maxForce;
            }
        }

        sling.isCharging = false;
        sling.lockedAim = null;
    }
};
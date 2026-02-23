// src/ecs/systems/SlingshotSystem.js
import { RaycastPlatformSystem } from './RaycastPlatformSystem';
import { findPlayer } from '../entities/player';

export const SlingshotSystem = (entities, inputManager) => {
    const player = findPlayer(entities);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    if (!sling) return;

    const vel = player.components.Velocity;
    const parent = player.components.Parent;
    const pos = player.components.Position;

    const stick = inputManager.getRightStickRaw();
    const mag = Math.sqrt(stick.x * stick.x + stick.y * stick.y);

    const ARM_THRESHOLD = 0.25;      // Lowered to detect intent earlier
    const LOCK_THRESHOLD = 0.7;     // Magnitude at which we "lock" the aim
    const RELEASE_THRESHOLD = 0.15; // Stick is effectively released

    // --- 1. CHARGING STATE ---
    if (mag >= ARM_THRESHOLD) {
        // Can only start charging if attached or on ground
        if (!sling.isCharging && (parent || (pos && pos.y >= 0))) {
            sling.isCharging = true;
            sling.peakMagnitude = 0;
            sling.lockedAim = null;
        }

        if (sling.isCharging) {
            // Update peak magnitude for force calculation
            if (mag > sling.peakMagnitude) {
                sling.peakMagnitude = mag;
            }

            // Lock aim if we push past LOCK_THRESHOLD or if we haven't locked yet
            // But once we've reached a high mag, we stop updating the aim to prevent snap-back
            if (!sling.lockedAim || mag >= sling.peakMagnitude * 0.9) {
                sling.lockedAim = { x: stick.x / mag, y: stick.y / mag };
            }
        }
    }
    // --- 2. RELEASE STATE ---
    else if (sling.isCharging && mag < RELEASE_THRESHOLD) {
        // Only launch if we reached a minimum peak (prevents accidental tiny bumps)
        if (sling.lockedAim && sling.peakMagnitude > 0.4) {
            const launchDir = { x: -sling.lockedAim.x, y: -sling.lockedAim.y };
            
            // Calculate force based on peak magnitude reached (clamped to 1.0)
            const forceMult = Math.min(1.0, sling.peakMagnitude);

            if (parent) {
                const hit = RaycastPlatformSystem.findTarget(entities, pos, launchDir, 500);
                if (hit && hit.entity.id === parent.id) {
                    pos.x = hit.point.x + (launchDir.x * 10);
                    pos.y = hit.point.y + (launchDir.y * 10);
                }
                delete player.components.Parent;
            }

            if (vel) {
                vel.x = launchDir.x * (sling.maxForce * forceMult);
                vel.y = launchDir.y * (sling.maxForce * forceMult);
            }
        }

        // Reset state
        sling.isCharging = false;
        sling.lockedAim = null;
        sling.peakMagnitude = 0;
    }
};
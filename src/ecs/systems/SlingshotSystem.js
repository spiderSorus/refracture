// src/ecs/systems/SlingshotSystem.js
import { RaycastPlatformSystem } from './RaycastPlatformSystem';
import { findPlayer } from '../entities/player';
import { PHYSICS } from '../../core/Constants';

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

    const ARM_THRESHOLD = 0.25;
    const LOCK_THRESHOLD = 0.7;
    const RELEASE_THRESHOLD = 0.15;

    // --- 1. CHARGING STATE ---
    if (mag >= ARM_THRESHOLD) {
        if (!sling.isCharging && parent) {
            sling.isCharging = true;
            sling.peakMagnitude = 0;
            sling.lockedAim = null;
        }

        if (sling.isCharging) {
            if (mag > sling.peakMagnitude) {
                sling.peakMagnitude = mag;
            }

            if (!sling.lockedAim || mag >= sling.peakMagnitude * 0.9) {
                sling.lockedAim = { x: stick.x / mag, y: stick.y / mag };
            }
        }
    }
    // --- 2. RELEASE STATE (Physics Impulse) ---
    else if (sling.isCharging && mag < RELEASE_THRESHOLD) {
        const MIN_CHARGE = 0.3;
        
        if (sling.lockedAim && sling.peakMagnitude > MIN_CHARGE) {
            const launchDir = { x: -sling.lockedAim.x, y: -sling.lockedAim.y };
            
            const chargeRange = 1.0 - MIN_CHARGE;
            const normalizedCharge = Math.min(1.0, (sling.peakMagnitude - MIN_CHARGE) / chargeRange);
            const forceMult = Math.pow(normalizedCharge, 2);

            if (parent) {
                sling.lastPlatformId = parent.id;
                sling.canJump = false;
                delete player.components.Parent;
            }

            if (vel) {
                const speed = sling.maxForce * forceMult;
                vel.x = launchDir.x * speed;
                vel.y = launchDir.y * speed;
                sling.isJumping = true; // Activate Jump Drag State
            }
        }

        sling.isCharging = false;
        sling.lockedAim = null;
        sling.peakMagnitude = 0;
    }
};
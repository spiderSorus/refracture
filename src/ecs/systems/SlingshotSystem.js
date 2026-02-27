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

    // --- 0. ANIMATION OVERRIDE ---
    if (sling.isAnimating) {
        return;
    }

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
    // --- 2. RELEASE STATE (Kinematic Trajectory Calculation) ---
    else if (sling.isCharging && mag < RELEASE_THRESHOLD) {
        const MIN_CHARGE = 0.3;
        
        if (sling.lockedAim && sling.peakMagnitude > MIN_CHARGE) {
            const launchDir = { x: -sling.lockedAim.x, y: -sling.lockedAim.y };
            
            const chargeRange = 1.0 - MIN_CHARGE;
            const normalizedCharge = Math.min(1.0, (sling.peakMagnitude - MIN_CHARGE) / chargeRange);
            const forceMult = Math.pow(normalizedCharge, 2);

            // Calculate Max Possible Distance with noise
            const noise = 1.0 + (Math.random() * 0.2 - 0.1); // +/- 10%
            const maxDist = PHYSICS.JUMP_MAX_DISTANCE * forceMult * noise;

            // PREDICT TARGET (Ignore current platform)
            const rayOrigin = { x: pos.x + launchDir.x * 20, y: pos.y + launchDir.y * 20 };
            const hit = RaycastPlatformSystem.findTarget(entities, rayOrigin, launchDir, maxDist);
            
            sling.isAnimating = true;
            sling.jumpProgress = 0;
            sling.jumpStart = { x: pos.x, y: pos.y };
            
            if (hit && hit.entity.id !== sling.lastPlatformId && hit.entity.components.AnchorTag) {
                // Land on Anchor
                sling.jumpTarget = { x: hit.point.x, y: hit.point.y };
                sling.jumpType = 'LAND';
                sling.jumpDuration = PHYSICS.JUMP_BASE_DURATION * (hit.distance / PHYSICS.JUMP_MAX_DISTANCE);
            } else {
                // Miss or hit non-anchor (we treat as miss for now)
                sling.jumpTarget = { 
                    x: pos.x + launchDir.x * maxDist, 
                    y: pos.y + launchDir.y * maxDist 
                };
                sling.jumpType = 'MISS';
                sling.jumpDuration = PHYSICS.JUMP_BASE_DURATION * forceMult;
            }

            // Peak height of parabola (perpendicular offset)
            sling.jumpPeak = (Phaser.Math.Distance.BetweenPoints(sling.jumpStart, sling.jumpTarget) * 0.25);

            if (parent) {
                sling.lastPlatformId = parent.id;
                sling.canJump = false;
                delete player.components.Parent;
            }

            if (vel) {
                vel.x = 0; vel.y = 0;
            }
        }

        sling.isCharging = false;
        sling.lockedAim = null;
        sling.peakMagnitude = 0;
    }
};
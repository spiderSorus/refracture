// src/ecs/systems/SlingshotSystem.js
export const SlingshotSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    const vel = player.components.Velocity;
    const parent = player.components.Parent;
    const pos = player.components.Position;

    const stick = inputManager.getRightStickRaw();
    const mag = Math.sqrt(stick.x * stick.x + stick.y * stick.y);
    const deadzone = 0.3;

    if (mag > deadzone) {
        // Can jump if attached to a platform OR at the hard floor (y=0)
        const isOnSurface = (parent || (pos && pos.y >= 0));

        if (!sling.isCharging && isOnSurface) {
            sling.isCharging = true;
        }

        if (sling.isCharging) {
            // Normalized Direction
            sling.vector = { x: stick.x / mag, y: stick.y / mag };
        }
    }
    else if (sling.isCharging) {
        // RELEASE TRIGGER
        if (sling.vector && (sling.vector.x !== 0 || sling.vector.y !== 0)) {
            if (vel) {
                // Fixed Power Jump
                vel.x = -sling.vector.x * sling.maxForce;
                vel.y = -sling.vector.y * sling.maxForce;

                if (parent) {
                    // Blacklist the current platform so we don't re-stick to it immediately
                    sling.lastPlatformId = parent.id;
                    delete player.components.Parent;
                }
            }
        }
        // Reset state
        sling.isCharging = false;
        // NOTE: We keep sling.vector until the NEXT charge so the Debug UI can show it
        sling.canJump = false;
        sling.dwellFrames = 0;
        sling.potentialPlatformId = null;
    }
};
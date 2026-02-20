export const SlingshotSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag && e.components.SlingshotJump);
    if (!player) return;

    const sling = player.components.SlingshotJump;
    const vel = player.components.Velocity;

    const stick = inputManager.getLeftStickRaw();
    const mag = Math.sqrt(stick.x * stick.x + stick.y * stick.y);
    const deadzone = 0.2; // Ignore tiny stick drifts

    if (mag > deadzone) {
        // CHARGING
        sling.isCharging = true;
        const cappedMag = Math.min(mag, 1.0);

        // Normalize charge from 0 to 1 based on how far past the deadzone we are
        sling.chargeRatio = (cappedMag - deadzone) / (1.0 - deadzone);
        sling.vector = { x: stick.x, y: stick.y };

    } else if (sling.isCharging) {
        // RELEASED - FIRE THE JUMP
        const force = sling.chargeRatio * sling.maxForce;

        // We use the LAST recorded vector before release
        const releaseMag = Math.sqrt(sling.vector.x * sling.vector.x + sling.vector.y * sling.vector.y);

        // Invert the vector (jump opposite of pull)
        const dirX = -sling.vector.x / releaseMag;
        const dirY = -sling.vector.y / releaseMag;

        if (vel) {
            vel.x = dirX * force;
            vel.y = dirY * force;
        }

        // Reset state
        sling.isCharging = false;
        sling.chargeRatio = 0;
        sling.vector = { x: 0, y: 0 };
    }
};
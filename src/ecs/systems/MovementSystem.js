import { GRID } from '../../core/Constants';

export const MovementSystem = (entities, inputManager) => {
    if (!inputManager) return;

    const velocity = GRID.SPEED * GRID.UNIT;
    const move = inputManager.getMovement();

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Rotation: rot, InputControlled: input } = entity.components;

        if (input && pos && vel) {
            // 1. Set Velocity
            vel.x = move.x * velocity;
            vel.y = move.y * velocity;

            // 2. Update Rotation based on direction of travel
            if (rot && (move.x !== 0 || move.y !== 0)) {
                // atan2 returns the angle in radians
                rot.angle = Math.atan2(move.y, move.x);
            }

            // 3. Grid Snapping when stopped
            if (move.x === 0 && move.y === 0) {
                pos.x = Math.round(pos.x / GRID.UNIT) * GRID.UNIT;
                pos.y = Math.round(pos.y / GRID.UNIT) * GRID.UNIT;
            }
        }
    });
};
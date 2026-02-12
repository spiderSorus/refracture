export const MovementSystem = (entities, inputManager) => {
    // If inputManager is missing, just bail instead of crashing the game
    if (!inputManager || typeof inputManager.getMovement !== 'function') {
        return;
    }

    const velocity = 50; // Per your 50px/sec requirement
    const move = inputManager.getMovement();

    entities.forEach(entity => {
        if (entity.components.InputControlled && entity.components.Velocity) {
            entity.components.Velocity.x = move.x * velocity;
            entity.components.Velocity.y = move.y * velocity;
        }
    });
};
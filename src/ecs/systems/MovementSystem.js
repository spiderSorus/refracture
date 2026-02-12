export const MovementSystem = (entities, inputManager) => {
    const speed = 300;
    const move = inputManager.getMovement();

    entities.forEach(entity => {
        if (entity.components.InputControlled && entity.components.Velocity) {
            entity.components.Velocity.x = move.x * speed;
            entity.components.Velocity.y = move.y * speed;
        }
    });
};
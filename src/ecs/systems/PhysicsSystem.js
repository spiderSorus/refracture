export const PhysicsSystem = (entities, delta) => {
    const dt = delta / 1000; // Convert to seconds

    entities.forEach(entity => {
        const pos = entity.components.Position;
        const vel = entity.components.Velocity;
        const gfx = entity.components.Graphic;

        if (pos && vel) {
            // Integration
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            // Sync Sprite
            if (gfx && gfx.sprite) {
                gfx.sprite.setPosition(pos.x, pos.y);
            }
        }
    });
};
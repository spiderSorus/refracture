export const PhysicsSystem = (entities, delta) => {
    // Delta is now expected to be fixed (e.g., 16.66ms)
    const dt = delta / 1000;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent } = entity.components;
        if (!pos) return;

        if (parent) {
            const platform = entities.find(e => e.id === parent.id);
            // Safety: Ensure platform still exists
            if (platform && platform.components.Position) {
                // Hard sync: World Pos = Platform World Pos + Local Offset
                pos.x = platform.components.Position.x + parent.offset.x;
                pos.y = platform.components.Position.y + parent.offset.y;
            } else {
                // Fallback: If platform died, detach? 
                // For now, do nothing or user remains at last pos.
            }
        } else if (vel) {
            // Standard Euler Integration
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;
        }
    });
};
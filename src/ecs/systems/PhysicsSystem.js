export const PhysicsSystem = (entities, delta) => {
    const dt = delta / 1000;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent } = entity.components;
        if (!pos) return;

        if (parent) {
            const platform = entities.filter(e => e.id === parent.id)[0];
            if (platform && platform.components.Position) {
                // Hard sync: World Pos = Platform World Pos + Local Offset
                pos.x = platform.components.Position.x + parent.offset.x;
                pos.y = platform.components.Position.y + parent.offset.y;
            }
        } else if (vel) {
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;
        }
    });
};
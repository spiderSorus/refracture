// src/ecs/systems/PhysicsSystem.js
export const PhysicsSystem = (entities, delta) => {
    const dt = delta / 1000;
    const FLOOR_Y = 0;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent } = entity.components;
        if (!pos) return;

        // --- ATTACHED SYNC ---
        if (parent) {
            const platform = entities.find(e => e.id === parent.id);
            if (platform && platform.components.Position) {
                // Hard-lock the world position to the platform + offset
                pos.x = platform.components.Position.x + parent.offset.x;
                pos.y = platform.components.Position.y + parent.offset.y;
            }
            if (vel) { vel.x = 0; vel.y = 0; }
            return;
        }

        // --- FREE MOVEMENT ---
        if (vel) {
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            if (entity.components.PlayerTag) {
                const sling = entity.components.SlingshotJump;
                // Floor Collision
                if (pos.y >= FLOOR_Y) {
                    pos.y = FLOOR_Y;
                    if (vel.y > 0) vel.y = 0;
                    if (sling) {
                        sling.canJump = true;
                        sling.lastPlatformId = null;
                    }
                } else {
                    // Air state
                    if (sling && !sling.isCharging && pos.y < -5) {
                        sling.canJump = false;
                    }
                }
            }
        }
    });
};
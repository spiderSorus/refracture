export const PhysicsSystem = (entities, delta) => {
    // Delta is now expected to be fixed (e.g., 16.66ms)
    const dt = delta / 1000;

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Parent: parent, PlayerTag: isPlayer } = entity.components;
        if (!pos) return;

        if (parent) {
            const platform = entities.find(e => e.id === parent.id);
            // Safety: Ensure platform still exists
            if (platform && platform.components.Position) {
                // Hard sync: World Pos = Platform World Pos + Local Offset
                pos.x = platform.components.Position.x + parent.offset.x;
                pos.y = platform.components.Position.y + parent.offset.y;
            }
        } else if (vel) {
            // Standard Euler Integration
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;

            // --- NEW: Basic Hard Collision for Platformer ---
            if (isPlayer) {
                entities.forEach(plat => {
                    // Make sure we are checking against platforms with colliders
                    if (plat.components.PlatformTag && plat.components.Collider) {
                        const platPos = plat.components.Position;
                        const col = plat.components.Collider;

                        // We primarily care about rect collisions for your floor/walls
                        if (col.type === 'rect') {
                            const halfW = col.width / 2;
                            const halfH = col.height / 2;
                            const left = platPos.x - halfW;
                            const right = platPos.x + halfW;
                            const top = platPos.y - halfH;
                            const bottom = platPos.y + halfH;

                            // Simple AABB penetration check (Is player center inside the box?)
                            if (pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom) {
                                // 1. Floor Collision (Falling Down)
                                if (vel.y > 0 && pos.y - vel.y * dt <= top) {
                                    pos.y = top - 1; // Snap just above the floor
                                    vel.y = 0;       // Kill vertical velocity
                                }
                                // 2. Left Wall Collision (Moving Left)
                                else if (vel.x < 0 && pos.x - vel.x * dt >= right) {
                                    pos.x = right + 1;
                                    vel.x = 0;
                                }
                                // 3. Right Wall Collision (Moving Right)
                                else if (vel.x > 0 && pos.x - vel.x * dt <= left) {
                                    pos.x = left - 1;
                                    vel.x = 0;
                                }
                                // 4. Ceiling Collision (Moving Up)
                                else if (vel.y < 0 && pos.y - vel.y * dt >= bottom) {
                                    pos.y = bottom + 1;
                                    vel.y = 0;
                                }
                            }
                        }
                    }
                });
            }
        }
    });
};
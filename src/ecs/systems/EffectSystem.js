// src/ecs/systems/EffectSystem.js
export const EffectSystem = (entities, dtSeconds) => {
    const player = entities.find(e => e.components.PlayerTag);
    const playerPos = player?.components.Position;

    entities.forEach(entity => {
        const lifespan = entity.components.Lifespan;
        const follow = entity.components.FollowPlayer;
        const pos = entity.components.Position;
        const vel = entity.components.Velocity;
        const renderable = entity.components.Renderable;

        // 1. Handle Lifespan
        if (lifespan) {
            lifespan.remaining -= dtSeconds * 1000;
            if (lifespan.remaining <= 0) {
                entity.toDestroy = true;
            }
            
            // Fade out
            if (renderable) {
                const ratio = Math.max(0, lifespan.remaining / lifespan.duration);
                Object.values(renderable.definitions).forEach(def => {
                    def.alpha = ratio * 0.8;
                });
            }
        }

        // 2. Handle Follow Player (Drift)
        if (follow && pos && vel && playerPos) {
            const dx = playerPos.x - pos.x;
            const dy = playerPos.y - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > follow.minDistance) {
                // Apply a gentle force towards the player
                const targetVx = (dx / dist) * follow.speed;
                const targetVy = (dy / dist) * follow.speed;

                // Lerp velocity towards target velocity for smooth drift
                const lerpFactor = 0.05;
                vel.x += (targetVx - vel.x) * lerpFactor;
                vel.y += (targetVy - vel.y) * lerpFactor;
            } else {
                // If close enough, just fade out faster or destroy
                if (lifespan) lifespan.remaining -= dtSeconds * 2000; 
            }
        }
    });
};

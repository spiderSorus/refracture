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

        let shouldFade = true;

        // 1. Handle Follow Player (Drift)
        if (follow && pos && vel && playerPos) {
            const dx = playerPos.x - pos.x;
            const dy = playerPos.y - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (!follow.reachedPlayer) {
                if (dist < follow.minDistance + 20) { // Slightly larger buffer for "reaching"
                    follow.reachedPlayer = true;
                }
                
                // If we haven't reached the player yet, don't fade out
                shouldFade = false;

                // Apply a gentle force towards the player
                const targetVx = (dx / dist) * follow.speed;
                const targetVy = (dy / dist) * follow.speed;

                // Lerp velocity towards target velocity for smooth drift
                const lerpFactor = 0.08;
                vel.x += (targetVx - vel.x) * lerpFactor;
                vel.y += (targetVy - vel.y) * lerpFactor;
            } else {
                // Slow down once reached
                vel.x *= 0.9;
                vel.y *= 0.9;
            }
        }

        // 2. Handle Lifespan & Fading
        if (lifespan) {
            if (shouldFade) {
                lifespan.remaining -= dtSeconds * 1000;
                if (lifespan.remaining <= 0) {
                    entity.toDestroy = true;
                }
                
                // Fade out
                if (renderable) {
                    const ratio = Math.max(0, lifespan.remaining / lifespan.duration);
                    Object.values(renderable.definitions).forEach(def => {
                        def.alpha = ratio;
                    });
                }
            } else if (renderable) {
                // Ensure full alpha while following
                Object.values(renderable.definitions).forEach(def => {
                    def.alpha = 1.0;
                });
            }
        }
    });
};

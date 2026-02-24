import { PHYSICS } from '../../core/Constants';

export const EnergySystem = (entities, dt, scene) => {
    // 1. DYNAMIC SCALE UPDATE (Universal)
    // Every entity with an Ego component updates its scale/collider relative to value
    entities.forEach(entity => {
        const ego = entity.components.Ego;
        if (!ego) return;

        ego.value = Math.max(0, Math.min(255, ego.value));

        const col = entity.components.Collider;
        const rend = entity.components.Renderable;
        if (!col) return;

        const newRadius = 20 + (ego.value * 0.8);
        const oldRadius = col.radius || newRadius;
        const scaleFactor = newRadius / oldRadius;

        if (Math.abs(scaleFactor - 1.0) > 0.0001) {
            entities.forEach(e => {
                const conn = e.components.WebConnection;
                if (conn) {
                    if (conn.fromId === entity.id) {
                        conn.fromOffset.x *= scaleFactor; conn.fromOffset.y *= scaleFactor;
                    }
                    if (conn.toId === entity.id) {
                        conn.toOffset.x *= scaleFactor; conn.toOffset.y *= scaleFactor;
                    }
                }
                const tether = e.components.WebTether;
                if (tether && tether.platformId === entity.id) {
                    tether.anchorOffset.x *= scaleFactor; tether.anchorOffset.y *= scaleFactor;
                }
                const parent = e.components.Parent;
                if (parent && parent.id === entity.id) {
                    parent.offset.x *= scaleFactor; parent.offset.y *= scaleFactor;
                }
            });
        }

        col.radius = newRadius;
        if (rend && rend.definitions['BASE']) {
            const base = rend.definitions['BASE'];
            if (base.type === 'circle') base.radius = newRadius;
            else if (base.type === 'rect') { base.width = newRadius * 2; base.height = newRadius * 2; }
        }
    });

    // 2. PLUG-AND-PLAY ENERGY LOGIC RULES
    if (scene && scene.energyRules) {
        if (Math.random() < 0.01) {
            console.log(`[ENERGY] Executing ${scene.energyRules.length} rules for scene: ${scene.scene.key}`);
        }
        scene.energyRules.forEach(rule => {
            rule(entities, dt, { GRAVITY: PHYSICS.GRAVITY || 980 });
        });
    } else if (Math.random() < 0.005) {
        console.warn(`[ENERGY] No energyRules defined for scene: ${scene?.scene?.key}`);
    }
};

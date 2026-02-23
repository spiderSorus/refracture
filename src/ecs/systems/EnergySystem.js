import { GRID } from '../../core/Constants';

export const EnergySystem = (entities, dt) => {
    // 1. EGO TRANSFER
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);

            if (entA && entB && entA.components.Ego && entB.components.Ego) {
                const egoA = entA.components.Ego;
                const egoB = entB.components.Ego;
                
                const diff = egoA.value - egoB.value;
                if (Math.abs(diff) > 0.1) {
                    const flow = Math.sign(diff) * conn.transferRate * dt;
                    const actualFlow = Math.abs(flow) > Math.abs(diff/2) ? diff/2 : flow;
                    
                    egoA.value -= actualFlow;
                    egoB.value += actualFlow;
                }
            }
        }
    });

    // 2. SCALE UPDATE & ANCHOR MIGRATION
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

        // If size changed significantly, scale all web offsets attached to this entity
        if (Math.abs(scaleFactor - 1.0) > 0.0001) {
            entities.forEach(e => {
                const conn = e.components.WebConnection;
                if (conn) {
                    if (conn.fromId === entity.id) {
                        conn.fromOffset.x *= scaleFactor;
                        conn.fromOffset.y *= scaleFactor;
                    }
                    if (conn.toId === entity.id) {
                        conn.toOffset.x *= scaleFactor;
                        conn.toOffset.y *= scaleFactor;
                    }
                }
                const tether = e.components.WebTether;
                if (tether && tether.platformId === entity.id) {
                    tether.anchorOffset.x *= scaleFactor;
                    tether.anchorOffset.y *= scaleFactor;
                }
                // Handle player parent offset if attached to this platform
                const parent = e.components.Parent;
                if (parent && parent.id === entity.id) {
                    parent.offset.x *= scaleFactor;
                    parent.offset.y *= scaleFactor;
                }
            });
        }

        // Apply new scale
        col.radius = newRadius;

        if (rend && rend.definitions['BASE']) {
            const base = rend.definitions['BASE'];
            if (base.type === 'circle') {
                base.radius = newRadius;
            } else if (base.type === 'rect') {
                base.width = newRadius * 2;
                base.height = newRadius * 2;
            }
        }
    });
};

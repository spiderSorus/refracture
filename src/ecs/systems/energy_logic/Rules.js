/**
 * Core conditions and actions for the Energy Logic system.
 */

const getPlayerLevel = (entities) => {
    const player = entities.find(e => e.components.PlayerTag);
    return player?.components.MeditationState?.currentLevel || 0;
};

// --- CONDITIONS ---

export const isNotConnected = (entity, entities) => {
    const connected = entities.some(e => {
        const conn = e.components.WebConnection;
        if (conn && (conn.fromId === entity.id || conn.toId === entity.id)) return true;
        const tether = e.components.WebTether;
        if (tether && tether.platformId === entity.id) return true;
        return false;
    });
    return !connected;
};

export const isConnectedToPlayer = (entity, entities) => {
    return entities.some(e => {
        const tether = e.components.WebTether;
        return (tether && tether.platformId === entity.id);
    });
};

export const isConnectedToAnything = (entity, entities) => {
    return entities.some(e => {
        const conn = e.components.WebConnection;
        if (conn && (conn.fromId === entity.id || conn.toId === entity.id)) return true;
        const tether = e.components.WebTether;
        if (tether && tether.platformId === entity.id) return true;
        return false;
    });
};

// --- ACTIONS / RULES ---

export const FloaterGravityRule = (entities, dt, constants) => {
    const { GRAVITY } = constants;
    entities.forEach(entity => {
        if (entity.components.PlatformTag && !entity.components.SpawnTag) {
            if (isConnectedToAnything(entity, entities)) {
                if (entity.components.Velocity) {
                    entity.components.Velocity.y += GRAVITY * dt;
                }
            }
        }
    });
};

/**
 * EgoGravityRule
 * ONLY the larger ego object is affected by gravity. 
 * If in balance, no motion occurs.
 */
export const EgoGravityRule = (entities, dt, constants) => {
    const { GRAVITY } = constants;
    const currentLevel = getPlayerLevel(entities);

    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);
            
            if (entA && entB && entA.components.Ego && entB.components.Ego) {
                const canA = entA.components.RealityLevel?.interact.includes(currentLevel) || (currentLevel === 0);
                const canB = entB.components.RealityLevel?.interact.includes(currentLevel) || (currentLevel === 0);
                if (!canA || !canB) return;

                const egoA = entA.components.Ego.value;
                const egoB = entB.components.Ego.value;

                // Threshold for balance
                const threshold = 5.0;
                
                if (Math.abs(egoA - egoB) > threshold) {
                    const target = egoA > egoB ? entA : entB;
                    const stationary = egoA > egoB ? entB : entA;

                    if (target.components.Velocity && !target.components.SpawnTag) {
                        target.components.Velocity.y += GRAVITY * dt;
                    }
                    // Force small one to stay still
                    if (stationary.components.Velocity) {
                        stationary.components.Velocity.x = 0;
                        stationary.components.Velocity.y = 0;
                    }
                } else {
                    // IN BALANCE: kill motion for both
                    if (entA.components.Velocity) { entA.components.Velocity.x = 0; entA.components.Velocity.y = 0; }
                    if (entB.components.Velocity) { entB.components.Velocity.x = 0; entB.components.Velocity.y = 0; }
                }
            }
        }
    });
};

export const EgoBalanceRule = (entities, dt) => {
    const currentLevel = getPlayerLevel(entities);

    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);
            
            if (entA && entB && entA.components.Ego && entB.components.Ego) {
                const canA = entA.components.RealityLevel?.interact.includes(currentLevel) || (currentLevel === 0);
                const canB = entB.components.RealityLevel?.interact.includes(currentLevel) || (currentLevel === 0);
                if (!canA || !canB) return;

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
};

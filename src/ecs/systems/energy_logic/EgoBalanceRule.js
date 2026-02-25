
const getPlayerLevel = (entities) => {
    const player = entities.find(e => e.components.PlayerTag);
    return player?.components.MeditationState?.currentLevel || 0;
};

/**
 * EgoBalanceRule
 * Ego flows between platforms connected by webs.
 * Only applies to platforms with Ego components (excludes Player and Spawn).
 */
export const EgoBalanceRule = (entities, dt) => {
    const currentLevel = getPlayerLevel(entities);
    
    // Helper to check if an entity is a valid ego-participating platform
    const isEgoPlatform = (ent) => {
        return ent && 
               ent.components.PlatformTag && 
               ent.components.Ego && 
               !ent.components.SpawnTag &&
               !ent.components.PlayerTag;
    };

    // Helper to apply flow between two entities
    const applyBalance = (entA, entB, transferRate) => {
        if (!isEgoPlatform(entA) || !isEgoPlatform(entB)) return;

        const canA = entA.components.RealityLevel?.interact.includes(currentLevel) || (currentLevel === 0);
        const canB = entB.components.RealityLevel?.interact.includes(currentLevel) || (currentLevel === 0);
        if (!canA || !canB) return;

        const egoA = entA.components.Ego;
        const egoB = entB.components.Ego;
        const diff = egoA.value - egoB.value;

        if (Math.abs(diff) > 0.1) {
            const flow = Math.sign(diff) * transferRate * dt;
            const actualFlow = Math.abs(flow) > Math.abs(diff / 2) ? diff / 2 : flow;
            egoA.value -= actualFlow;
            egoB.value += actualFlow;
        }
    };

    entities.forEach(e => {
        // Only transfer through fixed Web Connections between platforms
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);
            if (entA && entB) {
                applyBalance(entA, entB, conn.transferRate || 10);
            }
        }
    });
};
EgoBalanceRule.ruleName = 'EgoBalance';

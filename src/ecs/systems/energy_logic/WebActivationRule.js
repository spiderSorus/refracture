
/**
 * WebActivationRule
 * Platforms are dimmed by default.
 * They become visually "active" when part of a WebConnection.
 * Unlike other rules, this one keeps platforms STATIC.
 */
export const WebActivationRule = (entities, dt, constants) => {
    // 1. Reset all non-spawn platforms to inactive
    entities.forEach(entity => {
        if (entity.components.PlatformTag && !entity.components.SpawnTag) {
            entity.isActive = false;
        }
    });

    // 2. Activate platforms that are part of ANY WebConnection or Tether
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);
            if (entA) entA.isActive = true;
            if (entB) entB.isActive = true;
        }
        
        const tether = e.components.WebTether;
        if (tether) {
            const platform = entities.find(ent => ent.id === tether.platformId);
            if (platform) platform.isActive = true;
        }
    });

    // 3. Apply visuals (Removed)
};
WebActivationRule.ruleName = 'WebActivation';

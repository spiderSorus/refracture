/**
 * EgoGravityRule
 * If two connected entities have different ego sizes, 
 * gravity only affects the one with the LARGER ego.
 */
export const EgoGravityRule = (entities, dt, constants) => {
    const { GRAVITY } = constants;

    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);

            if (entA && entB && entA.components.Ego && entB.components.Ego) {
                const egoA = entA.components.Ego.value;
                const egoB = entB.components.Ego.value;

                // Identify the bigger one
                const target = egoA > egoB ? entA : (egoB > egoA ? entB : null);

                if (target && target.components.Velocity && !target.components.SpawnTag) {
                    // Use a higher multiplier to make the "weight" obvious
                    target.components.Velocity.y += GRAVITY * 2 * dt;
                    
                    if (Math.random() < 0.01) {
                        console.log(`[RULE] Applying Ego Gravity to: ${target.id} (Ego: ${target.components.Ego.value.toFixed(1)})`);
                    }
                }
            }
        }
    });
};
EgoGravityRule.ruleName = 'EgoGravity';

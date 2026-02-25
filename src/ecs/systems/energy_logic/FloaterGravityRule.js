
/**
 * FloaterGravityRule
 * Active platforms respond to gravity.
 */
export const FloaterGravityRule = (entities, dt, constants) => {
    const { GRAVITY } = constants;
    entities.forEach(entity => {
        if (entity.components.PlatformTag && !entity.components.SpawnTag) {
            if (entity.isActive && entity.components.Velocity && !entity.components.StaticTag) {
                entity.components.Velocity.y += GRAVITY * dt;
            }
        }
    });
};
FloaterGravityRule.ruleName = 'FloaterGravity';

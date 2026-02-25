
/**
 * DynamicStaticToggleRule
 * Toggles a platform between static and dynamic based on player attachment.
 */
export const DynamicStaticToggleRule = (entities, dt, constants) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;
    const parent = player.components.Parent;

    entities.forEach(entity => {
        if (!entity.components.PlatformTag || entity.components.SpawnTag) return;
        const isAttached = parent && parent.id === entity.id;

        if (isAttached) {
            // Keep it static while player is on it
            entity.components.StaticTag = entity.components.StaticTag || { _type: 'StaticTag' };
        } else {
            // Make it dynamic when player leaves
            if (entity.components.StaticTag) {
                delete entity.components.StaticTag;
                
                // Inherit player velocity if they just jumped off
                const sling = player.components.SlingshotJump;
                if (sling && sling.lastPlatformId === entity.id) {
                    const exitVel = player.components._lastVel;
                    if (exitVel && entity.components.Velocity) {
                        entity.components.Velocity.x = exitVel.x;
                        entity.components.Velocity.y = exitVel.y;
                    }
                }
            }
        }
    });
};
DynamicStaticToggleRule.ruleName = 'DynamicStaticToggle';

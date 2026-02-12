import Phaser from 'phaser';

export const TargetingSystem = (entities) => {
    const player = entities.find(e => e.components.PlayerTag && e.components.Targeter);
    const targetables = entities.filter(e => e.components.Targetable && e.components.Position);

    if (!player) return;

    const targeter = player.components.Targeter;
    const pPos = player.components.Position;

    let closestDist = Infinity;
    let closestEntity = null;

    // Reset and Find closest
    targetables.forEach(target => {
        const tPos = target.components.Position;
        const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, tPos.x, tPos.y);

        // Reset visual state
        if (target.components.Graphic?.sprite) {
            target.components.Graphic.sprite.setTint(target.components.Graphic.color);
        }

        // Proximity check (150px range)
        if (dist < 150 && dist < closestDist) {
            closestDist = dist;
            closestEntity = target;
        }
    });

    // Assign exactly one target
    targeter.currentTarget = closestEntity ? closestEntity.id : null;

    // Highlight the current target
    if (closestEntity && closestEntity.components.Graphic?.sprite) {
        closestEntity.components.Graphic.sprite.setTint(0xffff00);
    }
};
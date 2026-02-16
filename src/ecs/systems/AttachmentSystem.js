export const AttachmentSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;

    const pPos = player.components.Position;
    const parentComp = player.components.Parent;
    const bPressed = inputManager.getAction('BACK');

    // 1. If currently ATTACHED and B is pressed: DETACH
    if (parentComp && bPressed) {
        delete player.components.Parent;
        return;
    }

    // 2. If currently UNATTACHED and B is pressed: ATTEMPT ATTACH
    if (!parentComp && bPressed) {
        const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);

        for (const plat of platforms) {
            const platPos = plat.components.Position;
            const col = plat.components.Collider;
            let isOver = false;

            // Check if player center is within platform bounds
            if (col.type === 'circle') {
                const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, platPos.x, platPos.y);
                isOver = dist <= col.radius;
            } else {
                isOver = (pPos.x >= platPos.x - col.width / 2 && pPos.x <= platPos.x + col.width / 2 &&
                    pPos.y >= platPos.y - col.height / 2 && pPos.y <= platPos.y + col.height / 2);
            }

            if (isOver) {
                // LOCK: Store the current relative offset
                player.components.Parent = {
                    _type: 'Parent',
                    id: plat.id,
                    offset: { x: pPos.x - platPos.x, y: pPos.y - platPos.y }
                };
                break; // Only attach to one platform at a time
            }
        }
    }
};
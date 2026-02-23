export const CameraSystem = (entities, scene) => {
    const cam = scene.cameras.main;
    const player = entities.find(e => e.components.PlayerTag && e.components.Position);

    if (!player) {
        cam.centerOn(0, 0);
        return;
    }

    const pPos = player.components.Position;
    let targetX = pPos.x;
    let targetY = pPos.y;

    const lerp = 0.1;
    const currentX = cam.scrollX + cam.width / 2;
    const currentY = cam.scrollY + cam.height / 2;

    const newX = currentX + (targetX - currentX) * lerp;
    const newY = currentY + (targetY - currentY) * lerp;

    cam.centerOn(newX, newY);
};

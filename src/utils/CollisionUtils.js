// src/utils/CollisionUtils.js
import Phaser from 'phaser';

export const isOverlapping = (newPos, newCol, existingEntities) => {
    const platforms = existingEntities.filter(e => e.components.PlatformTag);
    const buffer = 20; // Extra space between platforms

    for (const plat of platforms) {
        const otherPos = plat.components.Position;
        const otherCol = plat.components.Collider;

        // 1. Circle to Circle
        if (newCol.type === 'circle' && otherCol.type === 'circle') {
            const dist = Phaser.Math.Distance.Between(newPos.x, newPos.y, otherPos.x, otherPos.y);
            if (dist < (newCol.radius + otherCol.radius + buffer)) return true;
        }
        // 2. AABB to AABB (Rectangles)
        else {
            const newW = newCol.width || newCol.radius * 2;
            const newH = newCol.height || newCol.radius * 2;
            const otherW = otherCol.width || otherCol.radius * 2;
            const otherH = otherCol.height || otherCol.radius * 2;

            const overlap = (
                Math.abs(newPos.x - otherPos.x) * 2 < (newW + otherW + buffer) &&
                Math.abs(newPos.y - otherPos.y) * 2 < (newH + otherH + buffer)
            );
            if (overlap) return true;
        }
    }
    return false;
};
// src/utils/CollisionUtils.js
import Phaser from 'phaser';

/**
 * Distance from point to line segment.
 */
export const pointToSegmentDist = (px, py, x1, y1, x2, y2) => {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
};

/**
 * Checks if a point is inside a collider.
 * @param {Object} point - {x, y}
 * @param {Object} colliderPos - {x, y}
 * @param {Object} collider - {type, radius, width, height, webData}
 * @param {number} buffer - Extra padding
 */
export const isPointInside = (point, colliderPos, collider, buffer = 0) => {
    if (collider.type === 'circle') {
        const distSq = (point.x - colliderPos.x) ** 2 + (point.y - colliderPos.y) ** 2;
        const limit = (collider.radius || 0) + buffer;
        return distSq <= limit * limit;
    } 
    else if (collider.type === 'rect') {
        const hw = ((collider.width || 0) / 2) + buffer;
        const hh = ((collider.height || 0) / 2) + buffer;
        return (
            point.x >= colliderPos.x - hw && point.x <= colliderPos.x + hw &&
            point.y >= colliderPos.y - hh && point.y <= colliderPos.y + hh
        );
    }
    else if (collider.type === 'web' && collider.webData) {
        // Special case for webs
        const { x1, y1, x2, y2 } = collider.webData;
        return pointToSegmentDist(point.x, point.y, x1, y1, x2, y2) <= (10 + buffer);
    }
    return false;
};

/**
 * Procedural generation helper to avoid overlapping platforms.
 */
export const isOverlapping = (newPos, newCol, existingEntities) => {
    const platforms = existingEntities.filter(e => e.components.PlatformTag);
    const buffer = 20;

    for (const plat of platforms) {
        const otherPos = plat.components.Position;
        const otherCol = plat.components.Collider;
        if (!otherPos || !otherCol) continue;

        if (newCol.type === 'circle' && otherCol.type === 'circle') {
            const dist = Phaser.Math.Distance.Between(newPos.x, newPos.y, otherPos.x, otherPos.y);
            if (dist < (newCol.radius + otherCol.radius + buffer)) return true;
        }
        else {
            const newW = newCol.width || (newCol.radius * 2) || 0;
            const newH = newCol.height || (newCol.radius * 2) || 0;
            const otherW = otherCol.width || (otherCol.radius * 2) || 0;
            const otherH = otherCol.height || (otherCol.radius * 2) || 0;

            const overlap = (
                Math.abs(newPos.x - otherPos.x) * 2 < (newW + otherW + buffer) &&
                Math.abs(newPos.y - otherPos.y) * 2 < (newH + otherH + buffer)
            );
            if (overlap) return true;
        }
    }
    return false;
};

/**
 * Snaps an offset point to be at least 'margin' pixels inside a collider's boundary.
 */
export const snapOffsetInside = (offset, collider, margin = 10) => {
    if (!collider) return { ...offset };
    if (collider.type === 'circle') {
        const dist = Math.sqrt(offset.x ** 2 + offset.y ** 2);
        const limit = Math.max(0, collider.radius - margin);
        if (dist > limit && dist > 0) {
            return {
                x: (offset.x / dist) * limit,
                y: (offset.y / dist) * limit
            };
        }
    } else if (collider.type === 'rect') {
        const hw = Math.max(0, (collider.width / 2) - margin);
        const hh = Math.max(0, (collider.height / 2) - margin);
        return {
            x: Math.max(-hw, Math.min(hw, offset.x)),
            y: Math.max(-hh, Math.min(hh, offset.y))
        };
    }
    return { ...offset };
};

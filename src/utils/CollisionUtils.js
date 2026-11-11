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
 * Ray-casting point-in-polygon check in local polygon space.
 */
export const isPointInPolygon = (px, py, points) => {
    if (!points || points.length < 3) return false;
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        const intersect = ((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-12) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

/**
 * Returns the closest point { x, y, dist } on a polygon's perimeter to (px, py).
 */
export const closestPointOnPolygon = (px, py, points) => {
    let minDistSq = Infinity;
    let bestX = px;
    let bestY = py;
    const n = points ? points.length : 0;
    for (let i = 0; i < n; i++) {
        const a = points[i];
        const b = points[(i + 1) % n];
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const lenSq = abx * abx + aby * aby;
        let t = 0;
        if (lenSq > 1e-12) {
            t = ((px - a.x) * abx + (py - a.y) * aby) / lenSq;
            t = Math.max(0, Math.min(1, t));
        }
        const cx = a.x + t * abx;
        const cy = a.y + t * aby;
        const dx = px - cx;
        const dy = py - cy;
        const dSq = dx * dx + dy * dy;
        if (dSq < minDistSq) {
            minDistSq = dSq;
            bestX = cx;
            bestY = cy;
        }
    }
    return { x: bestX, y: bestY, dist: Math.sqrt(minDistSq) };
};

/**
 * Checks if a point is inside a collider.
 * @param {Object} point - {x, y} (World Space)
 * @param {Object} colliderPos - {x, y} (World Space)
 * @param {Object} collider - {type, radius, width, height, points}
 * @param {number} buffer - Extra padding
 * @param {number} rotation - Rotation of the collider in radians
 */
export const isPointInside = (point, colliderPos, collider, buffer = 0, rotation = 0) => {
    if (collider.type === 'circle') {
        const distSq = (point.x - colliderPos.x) ** 2 + (point.y - colliderPos.y) ** 2;
        const limit = (collider.radius || 0) + buffer;
        return distSq <= limit * limit;
    } 
    else if (collider.type === 'rect') {
        // Transform point into collider's local space
        const dx = point.x - colliderPos.x;
        const dy = point.y - colliderPos.y;
        
        // Rotate by NEGATIVE rotation to un-rotate the world point into local axis-aligned space
        const cos = Math.cos(-rotation);
        const sin = Math.sin(-rotation);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const hw = ((collider.width || 0) / 2) + buffer;
        const hh = ((collider.height || 0) / 2) + buffer;
        
        return (
            localX >= -hw && localX <= hw &&
            localY >= -hh && localY <= hh
        );
    }
    else if (collider.type === 'polygon' && collider.points && collider.points.length >= 3) {
        const dx = point.x - colliderPos.x;
        const dy = point.y - colliderPos.y;
        const maxR = (collider.radius || 0) + Math.max(0, buffer);
        if (maxR > 0 && (dx * dx + dy * dy) > maxR * maxR) {
            return false;
        }

        const cos = Math.cos(-rotation);
        const sin = Math.sin(-rotation);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const inside = isPointInPolygon(localX, localY, collider.points);
        if (inside) {
            if (buffer >= 0) return true;
            return closestPointOnPolygon(localX, localY, collider.points).dist >= -buffer;
        }
        if (buffer > 0) {
            return closestPointOnPolygon(localX, localY, collider.points).dist <= buffer;
        }
        return false;
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
    } else if (collider.type === 'polygon' && collider.points && collider.points.length >= 3) {
        const pts = collider.points;
        const inside = isPointInPolygon(offset.x, offset.y, pts);
        const cp = closestPointOnPolygon(offset.x, offset.y, pts);

        if (inside && cp.dist >= margin) {
            return { x: offset.x, y: offset.y };
        }

        if (cp.dist > 1e-4) {
            // Direction from boundary point toward the interior
            const dirSign = inside ? 1 : -1;
            const ux = ((offset.x - cp.x) / cp.dist) * dirSign;
            const uy = ((offset.y - cp.y) / cp.dist) * dirSign;
            const candX = cp.x + ux * margin;
            const candY = cp.y + uy * margin;
            if (isPointInPolygon(candX, candY, pts)) {
                return { x: candX, y: candY };
            }
        }

        // Fallback at sharp vertices: step inward toward local centroid (0, 0)
        const cDist = Math.hypot(cp.x, cp.y) || 1;
        const step = Math.min(margin, cDist);
        return {
            x: cp.x - (cp.x / cDist) * step,
            y: cp.y - (cp.y / cDist) * step
        };
    }
    return { ...offset };
};

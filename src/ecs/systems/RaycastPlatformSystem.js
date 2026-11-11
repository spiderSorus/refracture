// src/ecs/systems/RaycastPlatformSystem.js
import Phaser from 'phaser';

/**
 * RaycastPlatformSystem
 * Utility for finding the intersection point between a ray (line) 
 * and platform colliders in the ECS.
 */
export const RaycastPlatformSystem = {
    /**
     * Finds the closest platform intersected by a ray.
     * @param {Array} entities - List of ECS entities
     * @param {Object} origin - {x, y} start of the ray
     * @param {Object} direction - Normalized {x, y} direction
     * @param {number} maxRange - Max distance to check
     */
    findTarget: (entities, origin, direction, maxRange = 1000) => {
        const platforms = entities.filter(e => {
            const isPlatform = e.components.PlatformTag && e.components.Collider;
            const zLayer = e.components.ZLayer;
            const isBackground = (zLayer && zLayer.type === 'BACKGROUND') || e.components.BackgroundTag;
            return isPlatform && !isBackground;
        });

        // Define the line segment for the ray
        const ray = new Phaser.Geom.Line(
            origin.x,
            origin.y,
            origin.x + direction.x * maxRange,
            origin.y + direction.y * maxRange
        );

        let closestHit = null;
        let minDist = Infinity;

        platforms.forEach(plat => {
            const pPos = plat.components.Position;
            const col = plat.components.Collider;

            if (!pPos) return;

            let intersectionPoints = [];

            // 1. Circle Intersection Logic
            if (col.type === 'circle') {
                const circle = new Phaser.Geom.Circle(pPos.x, pPos.y, col.radius);
                intersectionPoints = Phaser.Geom.Intersects.GetLineToCircle(ray, circle);
            }
            // 2. Polygon Intersection Logic
            else if (col.type === 'polygon' && col.points && col.points.length >= 3) {
                const pts = col.points;
                for (let i = 0; i < pts.length; i++) {
                    const a = pts[i];
                    const b = pts[(i + 1) % pts.length];
                    const seg = new Phaser.Geom.Line(pPos.x + a.x, pPos.y + a.y, pPos.x + b.x, pPos.y + b.y);
                    const out = new Phaser.Geom.Point();
                    if (Phaser.Geom.Intersects.LineToLine(ray, seg, out)) {
                        intersectionPoints.push({ x: out.x, y: out.y });
                    }
                }
            }
            // 3. Rectangle Intersection Logic
            else {
                const rect = new Phaser.Geom.Rectangle(
                    pPos.x - col.width / 2,
                    pPos.y - col.height / 2,
                    col.width,
                    col.height
                );
                intersectionPoints = Phaser.Geom.Intersects.GetLineToRectangle(ray, rect);
            }

            // 3. Select the closest point if multiple intersections occurred
            intersectionPoints.forEach(pt => {
                const d = Phaser.Math.Distance.Between(origin.x, origin.y, pt.x, pt.y);
                if (d < minDist) {
                    minDist = d;
                    closestHit = {
                        entity: plat,
                        point: pt,
                        distance: d,
                        // Relative offset used for snapping/parenting
                        offset: { x: pt.x - pPos.x, y: pt.y - pPos.y }
                    };
                }
            });
        });

        return closestHit;
    }
};
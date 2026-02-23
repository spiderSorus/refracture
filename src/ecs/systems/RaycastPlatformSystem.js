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
        const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);

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
            let intersectionPoints = [];

            // 1. Circle Intersection Logic
            if (col.type === 'circle') {
                const circle = new Phaser.Geom.Circle(pPos.x, pPos.y, col.radius);
                intersectionPoints = Phaser.Geom.Intersects.GetLineToCircle(ray, circle);
            }
            // 2. Rectangle Intersection Logic
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
                        // Relative offset used for snapping/parenting
                        offset: { x: pt.x - pPos.x, y: pt.y - pPos.y }
                    };
                }
            });
        });

        return closestHit;
    }
};
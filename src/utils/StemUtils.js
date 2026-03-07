/**
 * StemUtils
 * Shared logic for calculating the dynamic shape of a stem.
 */

export const getStemPoints = (config, time) => {
    const thickness = config.width || 20;
    const length = config.height || 200;
    const stiffness = config.stiffness ?? 0.5; // 0 (bendy from base) to 1 (only tip bends)

    const halfL = length / 2;
    const halfT = thickness / 2;

    // --- STIFFNESS LOGIC ---
    const activeRadius = Math.max(10, length * (1 - stiffness));
    const circleCenterY = -halfL + activeRadius; // Offset from tip down to the center

    // Max swing angle (less swing if stiffer/shorter radius)
    const maxSwing = 0.8 * (1 - stiffness * 0.5);
    const swingAngle = Math.sin(time) * maxSwing;
    
    const p0 = { x: 0, y: halfL }; // Base Center (fixed)
    
    // p3 (Tip Center) relative to circleCenter
    const p3 = { 
        x: Math.sin(swingAngle) * activeRadius, 
        y: circleCenterY - Math.cos(swingAngle) * activeRadius 
    };

    // --- TIP CAP ORIENTATION ---
    const relX = p3.x;
    const relY = p3.y - circleCenterY;
    const rx = relX / activeRadius;
    const ry = relY / activeRadius;

    // Tangent vector
    const tx = -ry;
    const ty = rx;

    const pTipLeft  = { x: p3.x - tx * halfT, y: p3.y - ty * halfT };
    const pTipRight = { x: p3.x + tx * halfT, y: p3.y + ty * halfT };

    // --- SPINE CURVE ---
    // p1: Base tangent (Always vertical)
    const p1 = { x: 0, y: p0.y - length * 0.3 };
    
    // p2: Tip tangent (Perpendicular to tip cap)
    const pull = Math.min(activeRadius * 0.4, length * 0.4);
    const p2 = { 
        x: p3.x - rx * pull, 
        y: p3.y - ry * pull 
    };

    return { p0, p1, p2, p3, pTipLeft, pTipRight, thickness, length, halfT, halfL };
};

/**
 * Cubic Bezier formula: (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
 */
export const getCubicBezierPoint = (t, p0, p1, p2, p3) => {
    const mt = 1 - t;
    return {
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
    };
};

/**
 * Approximate the closest point on a cubic bezier to a given point.
 */
export const getClosestPointOnBezier = (px, py, p0, p1, p2, p3, steps = 10) => {
    let bestDistSq = Infinity;
    let bestT = 0;
    let bestPos = { x: p0.x, y: p0.y };

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const pos = getCubicBezierPoint(t, p0, p1, p2, p3);
        const dSq = (px - pos.x) ** 2 + (py - pos.y) ** 2;
        if (dSq < bestDistSq) {
            bestDistSq = dSq;
            bestT = t;
            bestPos = pos;
        }
    }

    // Refine
    const step = 1 / steps;
    const startT = Math.max(0, bestT - step);
    const endT = Math.min(1, bestT + step);
    const refineSteps = 5;
    for (let i = 0; i <= refineSteps; i++) {
        const t = startT + (i / refineSteps) * (endT - startT);
        const pos = getCubicBezierPoint(t, p0, p1, p2, p3);
        const dSq = (px - pos.x) ** 2 + (py - pos.y) ** 2;
        if (dSq < bestDistSq) {
            bestDistSq = dSq;
            bestT = t;
            bestPos = pos;
        }
    }

    return { pos: bestPos, t: bestT, dist: Math.sqrt(bestDistSq) };
};

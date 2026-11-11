// src/world/FractureGraph.js
// Pure topological & geometric fracture graph generator.
// Hierarchy:
//   corners[cornerId] = { id: cornerId, x, y }
//   edges[edgeId]     = { id: edgeId, corners: [cornerA, cornerB] }
//   cells[cellId]     = { id: cellId, edges: [edgeId1, edgeId2, ...] }

export const UNIT_PLAYER_AREA = Math.PI * 0.5 * 0.5; // Area of 1 unit circle (diameter = 1)

/**
 * Deterministic PRNG (Mulberry32)
 */
export function createPRNG(seed = 1337) {
    let s = seed >>> 0;
    return function rand() {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Deterministic 2D Perlin Noise
 */
export class Perlin2D {
    constructor(seed = 1337) {
        const rand = createPRNG(seed);
        this.p = new Uint8Array(512);
        const perm = new Uint8Array(256);
        for (let i = 0; i < 256; i++) perm[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            const tmp = perm[i];
            perm[i] = perm[j];
            perm[j] = tmp;
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = perm[i & 255];
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 7;
        const u = h < 4 ? x : y;
        const v = h < 4 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = this.fade(xf);
        const v = this.fade(yf);

        const aa = this.p[this.p[X] + Y];
        const ab = this.p[this.p[X] + Y + 1];
        const ba = this.p[this.p[X + 1] + Y];
        const bb = this.p[this.p[X + 1] + Y + 1];

        const x1 = this.lerp(u, this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf));
        const x2 = this.lerp(u, this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1));
        return this.lerp(v, x1, x2) * 0.5;
    }
}

export function polygonSignedArea(pts) {
    let a = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        a += p1.x * p2.y - p2.x * p1.y;
    }
    return a * 0.5;
}

export function polygonAreaInPlayerUnits(pts) {
    return Math.abs(polygonSignedArea(pts)) / UNIT_PLAYER_AREA;
}

export function polygonCentroid(pts) {
    let cx = 0;
    let cy = 0;
    let a = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const cross = p1.x * p2.y - p2.x * p1.y;
        a += cross;
        cx += (p1.x + p2.x) * cross;
        cy += (p1.y + p2.y) * cross;
    }
    if (Math.abs(a) < 1e-7) {
        for (const p of pts) {
            cx += p.x;
            cy += p.y;
        }
        return { x: cx / (n || 1), y: cy / (n || 1) };
    }
    const factor = 1 / (3 * a);
    return { x: cx * factor, y: cy * factor };
}

function intersectRaySegment(px, py, dx, dy, ax, ay, bx, by) {
    const sx = bx - ax;
    const sy = by - ay;
    const denom = dx * sy - dy * sx;
    if (Math.abs(denom) < 1e-9) return null;

    const qpx = ax - px;
    const qpy = ay - py;
    const t = (qpx * sy - qpy * sx) / denom;
    const u = (qpx * dy - qpy * dx) / denom;

    if (t > 1e-5 && u >= -1e-7 && u <= 1 + 1e-7) {
        const clampedU = Math.max(0, Math.min(1, u));
        return {
            t,
            u: clampedU,
            x: ax + clampedU * sx,
            y: ay + clampedU * sy
        };
    }
    return null;
}

function cleanPolygon(pts) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const prev = out[out.length - 1];
        if (!prev || Math.hypot(p.x - prev.x, p.y - prev.y) > 1e-4) {
            out.push(p);
        }
    }
    if (out.length > 1) {
        const first = out[0];
        const last = out[out.length - 1];
        if (Math.hypot(first.x - last.x, first.y - last.y) <= 1e-4) {
            out.pop();
        }
    }
    return out;
}

function splitPolygonWithPerlinFracture(poly, ox, oy, angle, perlin, noiseScale, noiseStrength, subSteps = 3) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const n = poly.length;

    let hitFwd = null;
    let hitBwd = null;

    for (let i = 0; i < n; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % n];

        const f = intersectRaySegment(ox, oy, dx, dy, a.x, a.y, b.x, b.y);
        if (f && (!hitFwd || f.t < hitFwd.t)) {
            hitFwd = { ...f, edgeIndex: i };
        }

        const bw = intersectRaySegment(ox, oy, -dx, -dy, a.x, a.y, b.x, b.y);
        if (bw && (!hitBwd || bw.t < hitBwd.t)) {
            hitBwd = { ...bw, edgeIndex: i };
        }
    }

    if (!hitFwd || !hitBwd || hitFwd.edgeIndex === hitBwd.edgeIndex) {
        return null;
    }

    const chordDx = hitFwd.x - hitBwd.x;
    const chordDy = hitFwd.y - hitBwd.y;
    const chordLen = Math.hypot(chordDx, chordDy);
    if (chordLen < 1e-3) return null;

    const perpX = -chordDy / chordLen;
    const perpY = chordDx / chordLen;

    const fractureChain = [{ x: hitBwd.x, y: hitBwd.y }];
    for (let s = 1; s < subSteps; s++) {
        const frac = s / subSteps;
        const bx = hitBwd.x + chordDx * frac;
        const by = hitBwd.y + chordDy * frac;
        const envelope = Math.sin(frac * Math.PI);
        const nVal = perlin.noise(bx * noiseScale, by * noiseScale);
        const offset = nVal * chordLen * noiseStrength * envelope;
        fractureChain.push({
            x: bx + perpX * offset,
            y: by + perpY * offset
        });
    }
    fractureChain.push({ x: hitFwd.x, y: hitFwd.y });

    const polyA = [];
    for (let k = fractureChain.length - 1; k >= 0; k--) {
        polyA.push({ x: fractureChain[k].x, y: fractureChain[k].y });
    }
    let idx = (hitBwd.edgeIndex + 1) % n;
    while (idx !== (hitFwd.edgeIndex + 1) % n) {
        polyA.push({ x: poly[idx].x, y: poly[idx].y });
        idx = (idx + 1) % n;
    }

    const polyB = [];
    for (let k = 0; k < fractureChain.length; k++) {
        polyB.push({ x: fractureChain[k].x, y: fractureChain[k].y });
    }
    idx = (hitFwd.edgeIndex + 1) % n;
    while (idx !== (hitBwd.edgeIndex + 1) % n) {
        polyB.push({ x: poly[idx].x, y: poly[idx].y });
        idx = (idx + 1) % n;
    }

    return [cleanPolygon(polyA), cleanPolygon(polyB)];
}

/**
 * Generates a pure topological fracture graph for an N-gon circular universe.
 * Returns only pure graph metadata (`corners`, `edges`, `cells`) + generation parameters.
 */
export function generateFractureGraph(options = {}) {
    const {
        seed = 42,
        universeDiameter = 1000,
        boundarySides = 128,
        minCellPlayerAreas = 100,
        maxCellUniverseFraction = 0.01,
        branchingFactor = 0.65,
        perlinScale = 0.004,
        perlinStrength = 0.14
    } = options;

    const rand = createPRNG(seed);
    const perlin = new Perlin2D(seed ^ 0x9E3779B9);
    const radius = universeDiameter * 0.5;

    // 1. Create initial N-gon boundary
    const initialBoundary = [];
    for (let i = 0; i < boundarySides; i++) {
        const theta = (i / boundarySides) * Math.PI * 2;
        initialBoundary.push({
            x: Math.cos(theta) * radius,
            y: Math.sin(theta) * radius
        });
    }

    const totalUniversePlayerAreas = polygonAreaInPlayerUnits(initialBoundary);
    const maxCellPlayerAreas = Math.max(
        minCellPlayerAreas * 2.5,
        totalUniversePlayerAreas * maxCellUniverseFraction
    );

    // 2. Random fracture origin inside the circle
    const originRadius = radius * (0.1 + rand() * 0.35);
    const originAngle = rand() * Math.PI * 2;
    const fractureOrigin = {
        x: Math.cos(originAngle) * originRadius,
        y: Math.sin(originAngle) * originRadius
    };

    // 3. Propagate primary fracture lines & branches using Perlin noise
    let rawPolys = [initialBoundary];
    const primaryRays = Math.max(3, Math.round(3 + branchingFactor * 4));
    const fractureQueue = [];
    for (let r = 0; r < primaryRays; r++) {
        const baseAngle = (r / primaryRays) * Math.PI + (rand() - 0.5) * 0.35;
        fractureQueue.push({
            x: fractureOrigin.x + (rand() - 0.5) * radius * 0.08,
            y: fractureOrigin.y + (rand() - 0.5) * radius * 0.08,
            angle: baseAngle,
            depth: 0
        });
    }

    let iterations = 0;
    const maxQueueIterations = 250;
    while (fractureQueue.length > 0 && iterations < maxQueueIterations) {
        iterations++;
        const frac = fractureQueue.shift();
        const nextPolys = [];

        for (const poly of rawPolys) {
            const area = polygonAreaInPlayerUnits(poly);
            if (area <= minCellPlayerAreas * 2.1) {
                nextPolys.push(poly);
                continue;
            }

            const c = polygonCentroid(poly);
            const localNoise = perlin.noise(c.x * perlinScale, c.y * perlinScale);
            const deflectedAngle = frac.angle + localNoise * Math.PI * 0.65;

            const split = splitPolygonWithPerlinFracture(
                poly,
                frac.x,
                frac.y,
                deflectedAngle,
                perlin,
                perlinScale,
                perlinStrength,
                3
            );

            if (split && split[0].length >= 3 && split[1].length >= 3) {
                const areaA = polygonAreaInPlayerUnits(split[0]);
                const areaB = polygonAreaInPlayerUnits(split[1]);

                if (areaA >= minCellPlayerAreas && areaB >= minCellPlayerAreas) {
                    nextPolys.push(split[0], split[1]);

                    if (frac.depth < 4 && rand() < branchingFactor) {
                        const cA = polygonCentroid(split[0]);
                        const branchOffset = (0.35 + rand() * 0.65) * (rand() < 0.5 ? 1 : -1) * Math.PI * 0.5;
                        fractureQueue.push({
                            x: cA.x,
                            y: cA.y,
                            angle: deflectedAngle + branchOffset,
                            depth: frac.depth + 1
                        });
                    }
                    continue;
                }
            }
            nextPolys.push(poly);
        }
        rawPolys = nextPolys;
    }

    // 4. Subdivide any cells still larger than maxCellPlayerAreas
    let safety = 0;
    let needsSplit = true;
    while (needsSplit && safety < 12) {
        safety++;
        needsSplit = false;
        const refined = [];

        for (const poly of rawPolys) {
            const area = polygonAreaInPlayerUnits(poly);
            if (area > maxCellPlayerAreas) {
                const c = polygonCentroid(poly);
                let maxDist = 0;
                let longAngle = rand() * Math.PI;
                for (let i = 0; i < poly.length; i++) {
                    const dx = poly[i].x - c.x;
                    const dy = poly[i].y - c.y;
                    const d = dx * dx + dy * dy;
                    if (d > maxDist) {
                        maxDist = d;
                        longAngle = Math.atan2(dy, dx) + Math.PI * 0.5;
                    }
                }
                const nAngle = longAngle + perlin.noise(c.x * perlinScale * 2, c.y * perlinScale * 2) * 0.6;
                const jitter = Math.sqrt(area) * 0.05;
                const ox = c.x + (rand() - 0.5) * jitter;
                const oy = c.y + (rand() - 0.5) * jitter;

                const split = splitPolygonWithPerlinFracture(
                    poly,
                    ox,
                    oy,
                    nAngle,
                    perlin,
                    perlinScale * 1.5,
                    perlinStrength * 0.85,
                    2
                );

                if (split && split[0].length >= 3 && split[1].length >= 3) {
                    const a0 = polygonAreaInPlayerUnits(split[0]);
                    const a1 = polygonAreaInPlayerUnits(split[1]);
                    if (a0 >= minCellPlayerAreas && a1 >= minCellPlayerAreas) {
                        refined.push(split[0], split[1]);
                        if (a0 > maxCellPlayerAreas || a1 > maxCellPlayerAreas) {
                            needsSplit = true;
                        }
                        continue;
                    }
                }
            }
            refined.push(poly);
        }
        rawPolys = refined;
    }

    // 5. Build Pure Graph Metadata:
    //    corners[id] = { id, x, y }
    //    edges[id]   = { id, corners: [cornerA, cornerB] }
    //    cells[id]   = { id, edges: [edgeId1, edgeId2, ...] }
    const cornerMap = new Map();
    const corners = [];
    const SNAP = 100; // 0.01 coordinate precision for vertex welding

    function getOrCreateCorner(x, y) {
        const kx = Math.round(x * SNAP);
        const ky = Math.round(y * SNAP);
        const key = `${kx}:${ky}`;
        let id = cornerMap.get(key);
        if (id !== undefined) return id;

        id = corners.length;
        corners.push({
            id,
            x: kx / SNAP,
            y: ky / SNAP
        });
        cornerMap.set(key, id);
        return id;
    }

    const edgeMap = new Map();
    const edges = [];

    function getOrCreateEdge(c1, c2) {
        const minC = Math.min(c1, c2);
        const maxC = Math.max(c1, c2);
        const key = `${minC}_${maxC}`;
        let edgeId = edgeMap.get(key);
        if (edgeId !== undefined) return edgeId;

        edgeId = edges.length;
        edges.push({
            id: edgeId,
            corners: [minC, maxC]
        });
        edgeMap.set(key, edgeId);
        return edgeId;
    }

    const cells = rawPolys.map((poly, cellId) => {
        const cornerLoop = [];
        for (const pt of poly) {
            const cid = getOrCreateCorner(pt.x, pt.y);
            if (cornerLoop.length === 0 || cornerLoop[cornerLoop.length - 1] !== cid) {
                cornerLoop.push(cid);
            }
        }
        if (cornerLoop.length > 1 && cornerLoop[0] === cornerLoop[cornerLoop.length - 1]) {
            cornerLoop.pop();
        }

        const cellEdges = [];
        for (let i = 0; i < cornerLoop.length; i++) {
            const cA = cornerLoop[i];
            const cB = cornerLoop[(i + 1) % cornerLoop.length];
            if (cA !== cB) {
                cellEdges.push(getOrCreateEdge(cA, cB));
            }
        }

        return {
            id: cellId,
            edges: cellEdges
        };
    });

    return {
        seed,
        universeDiameter,
        radius,
        boundarySides,
        fractureOrigin,
        totalUniversePlayerAreas,
        minCellPlayerAreas,
        maxCellPlayerAreas,
        corners,
        edges,
        cells
    };
}

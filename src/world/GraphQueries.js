// src/world/GraphQueries.js
// Pure geometric and topological queries over a FractureGraph (`corners`, `edges`, `cells`).
// All relationships are derived directly from Corner IDs and Edge IDs.

import { polygonCentroid, polygonAreaInPlayerUnits } from './FractureGraph';

/**
 * Reconstructs the ordered loop of corner IDs around a cell from its ordered `edges` array.
 */
export function getCellCornerIds(graph, cellId) {
    const cell = graph.cells[cellId];
    if (!cell || !cell.edges || cell.edges.length === 0) return [];

    const edgeCount = cell.edges.length;
    if (edgeCount === 1) {
        return [...graph.edges[cell.edges[0]].corners];
    }

    const cornerIds = [];
    for (let i = 0; i < edgeCount; i++) {
        const currEdge = graph.edges[cell.edges[i]];
        const nextEdge = graph.edges[cell.edges[(i + 1) % edgeCount]];
        const [c0, c1] = currEdge.corners;
        const [n0, n1] = nextEdge.corners;

        // The shared corner between currEdge and nextEdge is the vertex at the end of currEdge
        const sharedCorner = (c1 === n0 || c1 === n1) ? c1 : c0;
        const startCorner = sharedCorner === c1 ? c0 : c1;
        cornerIds.push(startCorner);
    }

    return cornerIds;
}

/**
 * Returns the ordered array of `{ id, x, y }` corner objects for a cell.
 */
export function getCellPolygon(graph, cellId) {
    const cornerIds = getCellCornerIds(graph, cellId);
    return cornerIds.map(cid => graph.corners[cid]);
}

/**
 * Computes the unscrambled centroid `{ x, y }` of a cell from its corners.
 */
export function getCellCentroid(graph, cellId) {
    const poly = getCellPolygon(graph, cellId);
    return polygonCentroid(poly);
}

/**
 * Computes the area of a cell in player-unit circles.
 */
export function getCellAreaInPlayerUnits(graph, cellId) {
    const poly = getCellPolygon(graph, cellId);
    return polygonAreaInPlayerUnits(poly);
}

/**
 * Returns `{ centroid: { x, y }, vertices: [{ cornerId, x, y }, ...] }` where vertices
 * are local coordinates relative to the cell's centroid.
 */
export function getCellLocalGeometry(graph, cellId) {
    const poly = getCellPolygon(graph, cellId);
    const centroid = polygonCentroid(poly);
    const vertices = poly.map(corner => ({
        cornerId: corner.id,
        x: corner.x - centroid.x,
        y: corner.y - centroid.y
    }));
    return {
        centroid,
        vertices,
        areaInPlayerUnits: polygonAreaInPlayerUnits(poly)
    };
}

/**
 * Returns the IDs of all edges that share a corner ID with `edgeId`.
 */
export function getNeighboringEdgeIds(graph, edgeId) {
    const target = graph.edges[edgeId];
    if (!target) return [];
    const [cA, cB] = target.corners;
    const neighbors = [];
    for (const edge of graph.edges) {
        if (edge.id === edgeId) continue;
        if (edge.corners.includes(cA) || edge.corners.includes(cB)) {
            neighbors.push(edge.id);
        }
    }
    return neighbors;
}

/**
 * Returns the IDs of all cells that share at least one edge ID with `cellId`.
 */
export function getNeighboringCellIds(graph, cellId) {
    const target = graph.cells[cellId];
    if (!target) return [];
    const edgeSet = new Set(target.edges);
    const neighbors = [];
    for (const cell of graph.cells) {
        if (cell.id === cellId) continue;
        if (cell.edges.some(eid => edgeSet.has(eid))) {
            neighbors.push(cell.id);
        }
    }
    return neighbors;
}

/**
 * Computes cell positions (in player-width graph units) separated by `gapInPlayerWidths`
 * between adjacent cells' shared edges.
 * Returns `{ positions: [{ x, y }, ...], centerCellId }`.
 */
export function computeSpreadCellPositions(graph, gapInPlayerWidths = 0) {
    const n = graph.cells.length;
    const centroids = new Array(n);
    let centerCellId = 0;
    let minCenterDistSq = Infinity;

    for (let i = 0; i < n; i++) {
        const c = getCellCentroid(graph, i);
        centroids[i] = c;
        const dSq = c.x * c.x + c.y * c.y;
        if (dSq < minCenterDistSq) {
            minCenterDistSq = dSq;
            centerCellId = i;
        }
    }

    if (gapInPlayerWidths <= 0 || n <= 1) {
        return {
            positions: centroids.map(c => ({ x: c.x, y: c.y })),
            centerCellId
        };
    }

    // Derive shared-edge cell pairs directly from edge IDs
    const edgeToCells = new Map();
    for (const cell of graph.cells) {
        for (const eid of cell.edges) {
            let list = edgeToCells.get(eid);
            if (!list) {
                list = [];
                edgeToCells.set(eid, list);
            }
            list.push(cell.id);
        }
    }

    const pairMap = new Map();
    let totalRatio = 0;
    let pairCount = 0;

    for (const cellList of edgeToCells.values()) {
        if (cellList.length === 2) {
            const a = Math.min(cellList[0], cellList[1]);
            const b = Math.max(cellList[0], cellList[1]);
            const key = `${a}_${b}`;
            if (!pairMap.has(key)) {
                const dx = centroids[b].x - centroids[a].x;
                const dy = centroids[b].y - centroids[a].y;
                const dist = Math.hypot(dx, dy) || 1;
                const scale = 1 + gapInPlayerWidths / dist;
                pairMap.set(key, {
                    a,
                    b,
                    targetDx: dx * scale,
                    targetDy: dy * scale
                });
                totalRatio += gapInPlayerWidths / dist;
                pairCount++;
            }
        }
    }

    const avgScale = 1 + (pairCount > 0 ? totalRatio / pairCount : 0.2);
    const positions = centroids.map(c => ({
        x: c.x * avgScale,
        y: c.y * avgScale
    }));

    const pairs = Array.from(pairMap.values());
    const iterations = 40;
    for (let iter = 0; iter < iterations; iter++) {
        for (const p of pairs) {
            const posA = positions[p.a];
            const posB = positions[p.b];
            const errX = (posB.x - posA.x) - p.targetDx;
            const errY = (posB.y - posA.y) - p.targetDy;
            posA.x += errX * 0.25;
            posA.y += errY * 0.25;
            posB.x -= errX * 0.25;
            posB.y -= errY * 0.25;
        }
    }

    // Anchor the center-most cell at (0, 0) so the player spawns at the origin
    const anchorX = positions[centerCellId].x;
    const anchorY = positions[centerCellId].y;
    for (let i = 0; i < n; i++) {
        positions[i].x -= anchorX;
        positions[i].y -= anchorY;
    }

    return { positions, centerCellId };
}

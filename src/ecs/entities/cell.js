// src/ecs/entities/cell.js
import {
    Position,
    Velocity,
    Rotation,
    Renderable,
    ZLayer,
    PlatformTag,
    StaticTag,
    SpawnTag,
    Collider,
    Mass,
    CellMeta
} from '../components/index';
import { getCellLocalGeometry, computeSpreadCellPositions } from '../../world/GraphQueries';
import { resolveCellStyle } from '../../styles/CellStyles';
import { resolveGraphStyle } from '../../styles/GraphStyles';

/**
 * Creates component array for a single Land Cell entity from pure graph metadata.
 */
export const createCell = (graph, cellId, options = {}) => {
    const unitToPixel = options.unitToPixel ?? 20.0; // Default: 1 player width = 20px (player radius = 10px)
    const style = resolveCellStyle(options.style || 'SLATE_SHARD', options.styleOverrides);
    const { centroid, vertices, areaInPlayerUnits } = getCellLocalGeometry(graph, cellId);
    const cell = graph.cells[cellId];

    const worldX = (options.x ?? centroid.x) * unitToPixel;
    const worldY = (options.y ?? centroid.y) * unitToPixel;

    // Local polygon vertices in pixel space for Polygon Collider
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let maxRadius = 0;
    const pixelPoints = vertices.map(v => {
        const px = v.x * unitToPixel;
        const py = v.y * unitToPixel;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
        const r = Math.hypot(px, py);
        if (r > maxRadius) maxRadius = r;
        return { x: px, y: py };
    });

    const widthPx = Number.isFinite(maxX - minX) ? (maxX - minX) : 100;
    const heightPx = Number.isFinite(maxY - minY) ? (maxY - minY) : 100;

    const components = [
        { id: `cell_${cellId}` },
        Position(worldX, worldY),
        Velocity(0, 0),
        Rotation(options.rotation ?? 0),
        ZLayer(options.zLayer || 'PLAY', options.zIndex ?? 10),
        PlatformTag(),
        StaticTag(),
        Collider('polygon', maxRadius, widthPx, heightPx, pixelPoints),
        Mass(areaInPlayerUnits),
        CellMeta(cellId, cell.edges, areaInPlayerUnits),
        Renderable({
            BASE: {
                type: 'cell_polygon',
                vertices,
                unitToPixel,
                style,
                depth: options.depth ?? 10
            }
        })
    ];

    if (options.isSpawn) {
        components.push(SpawnTag());
    }

    return components;
};

/**
 * Creates component array for an optional Graph Overlay entity (boundary, edges, corners).
 */
export const createGraphOverlay = (graph, options = {}) => {
    const unitToPixel = options.unitToPixel ?? 20.0;
    const style = resolveGraphStyle(options.style || 'HIDDEN', options.styleOverrides);

    return [
        { id: 'graph_overlay' },
        Position(0, 0),
        Rotation(0),
        ZLayer(options.zLayer || 'FOREGROUND', options.zIndex ?? 10),
        Renderable({
            OVERLAY: {
                type: 'graph_overlay',
                graph,
                unitToPixel,
                style,
                depth: options.depth ?? 50
            }
        })
    ];
};

/**
 * Spawns all cells of a FractureGraph into an ECS scene.
 * Supports `gapInPlayerWidths` (e.g. 10 player widths between cells) and `markCenterAsSpawn`.
 */
export const spawnGraphCells = (scene, graph, options = {}) => {
    const gapInPlayerWidths = options.gapInPlayerWidths ?? 0;
    const markCenterAsSpawn = options.markCenterAsSpawn ?? true;
    const { positions, centerCellId } = computeSpreadCellPositions(graph, gapInPlayerWidths);

    return graph.cells.map(cell => {
        const pos = positions[cell.id];
        return scene.addEntity(createCell(graph, cell.id, {
            ...options,
            x: pos.x,
            y: pos.y,
            isSpawn: markCenterAsSpawn && cell.id === centerCellId
        }));
    });
};

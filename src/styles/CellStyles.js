// src/styles/CellStyles.js
// Decoupled visual style definitions for Land Cells.
// Graph metadata (`src/world/FractureGraph.js`) holds zero visual properties;
// scenes or style systems pass a CellStyle config to `CellPolygonGraphic`.

export const CELL_STYLE_PRESETS = {
    SLATE_SHARD: {
        id: 'SLATE_SHARD',
        label: 'Slate Shard',
        fillColor: 0x1b263b,
        fillAlpha: 0.88,
        strokeColor: 0x778da9,
        strokeAlpha: 0.9,
        strokeWidth: 1.5,
        pipeline: null
    },
    MONOCHROME_INK: {
        id: 'MONOCHROME_INK',
        label: 'Monochrome Ink',
        fillColor: 0x121216,
        fillAlpha: 0.95,
        strokeColor: 0xe0e1dd,
        strokeAlpha: 0.85,
        strokeWidth: 1.25,
        pipeline: null
    },
    AQUARELLE_PANE: {
        id: 'AQUARELLE_PANE',
        label: 'Aquarelle Pane',
        fillColor: 0x2a475e,
        fillAlpha: 0.78,
        strokeColor: 0x66c0f4,
        strokeAlpha: 0.75,
        strokeWidth: 2.0,
        pipeline: 'Aquarelle'
    },
    FLAT_SEAMLESS: {
        id: 'FLAT_SEAMLESS',
        label: 'Flat Seamless (No Stroke)',
        fillColor: 0x22303c,
        fillAlpha: 1.0,
        strokeColor: 0x22303c,
        strokeAlpha: 0.0,
        strokeWidth: 0,
        pipeline: null
    },
    WIREFRAME_ONLY: {
        id: 'WIREFRAME_ONLY',
        label: 'Wireframe Only',
        fillColor: 0x000000,
        fillAlpha: 0.0,
        strokeColor: 0x4cc9f0,
        strokeAlpha: 0.95,
        strokeWidth: 1.5,
        pipeline: null
    }
};

export const CELL_STYLE_KEYS = Object.keys(CELL_STYLE_PRESETS);

/**
 * Resolves a preset name or custom style object with optional overrides.
 */
export function resolveCellStyle(styleOrKey = 'SLATE_SHARD', overrides = {}) {
    const base = typeof styleOrKey === 'string'
        ? (CELL_STYLE_PRESETS[styleOrKey] || CELL_STYLE_PRESETS.SLATE_SHARD)
        : styleOrKey;

    return {
        ...CELL_STYLE_PRESETS.SLATE_SHARD,
        ...base,
        ...overrides
    };
}

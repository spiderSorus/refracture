// src/styles/GraphStyles.js
// Decoupled visual style definitions for the Fracture Graph overlay (edges, corners, boundary).

export const GRAPH_STYLE_PRESETS = {
    HIDDEN: {
        id: 'HIDDEN',
        label: 'Hidden',
        showBoundary: false,
        showEdges: false,
        showCorners: false,
        showFractureOrigin: false
    },
    BOUNDARY_ONLY: {
        id: 'BOUNDARY_ONLY',
        label: 'Boundary Circle Only',
        showBoundary: true,
        boundaryColor: 0x335577,
        boundaryAlpha: 0.4,
        boundaryWidth: 1.5,
        showEdges: false,
        showCorners: false,
        showFractureOrigin: false
    },
    EDGES_AND_CORNERS: {
        id: 'EDGES_AND_CORNERS',
        label: 'Graph Edges & Corners',
        showBoundary: true,
        boundaryColor: 0x335577,
        boundaryAlpha: 0.4,
        boundaryWidth: 1.5,
        showEdges: true,
        edgeColor: 0x00f5d4,
        edgeAlpha: 0.65,
        edgeWidth: 1.25,
        showCorners: true,
        cornerColor: 0xfee440,
        cornerAlpha: 0.9,
        cornerRadius: 2.5,
        showFractureOrigin: true,
        originColor: 0xff3366,
        originRadius: 5.0
    }
};

export const GRAPH_STYLE_KEYS = Object.keys(GRAPH_STYLE_PRESETS);

export function resolveGraphStyle(styleOrKey = 'HIDDEN', overrides = {}) {
    const base = typeof styleOrKey === 'string'
        ? (GRAPH_STYLE_PRESETS[styleOrKey] || GRAPH_STYLE_PRESETS.HIDDEN)
        : styleOrKey;

    return {
        ...GRAPH_STYLE_PRESETS.HIDDEN,
        ...base,
        ...overrides
    };
}

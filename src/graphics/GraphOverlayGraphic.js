// src/graphics/GraphOverlayGraphic.js
import { BaseGraphic } from './BaseGraphic';
import { resolveGraphStyle } from '../styles/GraphStyles';

export class GraphOverlayGraphic extends BaseGraphic {
    create(config) {
        this.gfx = this.scene.add.graphics();
        this._lastKey = null;
        this.drawOverlay(config);
        return this.gfx;
    }

    drawOverlay(config) {
        if (!this.gfx) return;

        const graph = config.graph;
        const s = config.unitToPixel ?? 2.0;
        const style = resolveGraphStyle(config.style, config.styleOverrides);

        const key = `${graph ? graph.seed : 'none'}_${style.id}_${style.showBoundary}_${style.showEdges}_${style.showCorners}_${style.showFractureOrigin}_${s}`;
        if (this._lastKey === key) return;
        this._lastKey = key;

        this.gfx.clear();
        if (!graph) return;

        // 1. N-gon universe circle boundary
        if (style.showBoundary) {
            this.gfx.lineStyle(style.boundaryWidth ?? 1.5, style.boundaryColor ?? 0x335577, style.boundaryAlpha ?? 0.4);
            this.gfx.strokeCircle(0, 0, graph.radius * s);
        }

        // 2. Graph Edges (each edge connects 2 corner IDs)
        if (style.showEdges) {
            this.gfx.lineStyle(style.edgeWidth ?? 1.25, style.edgeColor ?? 0x00f5d4, style.edgeAlpha ?? 0.65);
            for (const edge of graph.edges) {
                const cA = graph.corners[edge.corners[0]];
                const cB = graph.corners[edge.corners[1]];
                if (cA && cB) {
                    this.gfx.lineBetween(cA.x * s, cA.y * s, cB.x * s, cB.y * s);
                }
            }
        }

        // 3. Graph Corners (unique corner IDs)
        if (style.showCorners) {
            const r = style.cornerRadius ?? 2.5;
            this.gfx.fillStyle(style.cornerColor ?? 0xfee440, style.cornerAlpha ?? 0.9);
            for (const corner of graph.corners) {
                this.gfx.fillCircle(corner.x * s, corner.y * s, r);
            }
        }

        // 4. Fracture seed point
        if (style.showFractureOrigin && graph.fractureOrigin) {
            this.gfx.fillStyle(style.originColor ?? 0xff3366, 0.95);
            this.gfx.fillCircle(
                graph.fractureOrigin.x * s,
                graph.fractureOrigin.y * s,
                style.originRadius ?? 5.0
            );
        }
    }

    onUpdate(config) {
        this.drawOverlay(config);
    }
}

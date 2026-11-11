// src/graphics/CellPolygonGraphic.js
import { BaseGraphic } from './BaseGraphic';
import { resolveCellStyle } from '../styles/CellStyles';

export class CellPolygonGraphic extends BaseGraphic {
    create(config) {
        this.gfx = this.scene.add.graphics();
        this._lastStyleKey = null;
        this.drawCell(config);
        return this.gfx;
    }

    drawCell(config) {
        if (!this.gfx) return;

        const verts = config.vertices || [];
        const s = config.unitToPixel ?? 2.0;
        const style = resolveCellStyle(config.style, config.styleOverrides);

        const styleKey = `${style.id}_${style.fillColor}_${style.fillAlpha}_${style.strokeColor}_${style.strokeAlpha}_${style.strokeWidth}_${style.pipeline}_${s}_${verts.length}`;
        if (this._lastStyleKey === styleKey) return;
        this._lastStyleKey = styleKey;

        this.gfx.clear();
        if (verts.length < 3) return;

        if (style.fillAlpha > 0) {
            this.gfx.fillStyle(style.fillColor, style.fillAlpha);
        }
        if (style.strokeWidth > 0 && style.strokeAlpha > 0) {
            this.gfx.lineStyle(style.strokeWidth, style.strokeColor, style.strokeAlpha);
        }

        this.gfx.beginPath();
        this.gfx.moveTo(verts[0].x * s, verts[0].y * s);
        for (let i = 1; i < verts.length; i++) {
            this.gfx.lineTo(verts[i].x * s, verts[i].y * s);
        }
        this.gfx.closePath();

        if (style.fillAlpha > 0) {
            this.gfx.fillPath();
        }
        if (style.strokeWidth > 0 && style.strokeAlpha > 0) {
            this.gfx.strokePath();
        }

        if (this.gfx.setPipeline && this.gfx.resetPipeline) {
            if (style.pipeline) {
                this.gfx.setPipeline(style.pipeline);
            } else {
                this.gfx.resetPipeline();
            }
        }
    }

    onUpdate(config) {
        this.drawCell(config);
    }
}

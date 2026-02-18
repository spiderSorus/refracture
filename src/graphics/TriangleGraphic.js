import { BaseGraphic } from './BaseGraphic';
import { GRID } from '../core/Constants';
import Phaser from 'phaser';

export class TriangleGraphic extends BaseGraphic {
    create(config) {
        // Use a Graphics object instead of a Polygon Shape.
        // Graphics pivot exactly at (0,0) by default, ensuring a perfect "spin".
        return this.scene.add.graphics();
    }

    onUpdate(config) {
        const gfx = this.gameObject;
        if (!gfx) return;

        // 1. CLEAR previous frame (essential for dynamic zoom thickness)
        gfx.clear();

        // 2. CONFIGURATION
        const cam = this.scene.cameras.main;
        // Stroke stays 2px thick regardless of zoom
        const thickness = 2 / cam.zoom;
        const colorVal = Phaser.Display.Color.HexStringToColor(config.color || '#ff8400').color;
        const intensity = config.intensity ?? 1.0;

        // 3. SIZE CALCULATION
        // "10x10 World Units" means 10 * GRID.UNIT (10px) = 100px total span.
        // To span 100px centered at 0, radius 's' must be 50.
        // config.size of 5.0 * 10 = 50.
        const unit = GRID.UNIT;
        const s = (config.size || 1) * unit * intensity;

        // 4. DRAW
        // We draw relative to local (0,0), which BaseGraphic has already moved to the Player's position.
        gfx.fillStyle(colorVal, 1);
        gfx.lineStyle(thickness, 0xffffff);

        gfx.beginPath();
        gfx.moveTo(s, 0);       // Tip (Right)
        gfx.lineTo(-s, -s);     // Top Back
        gfx.lineTo(-s, s);      // Bottom Back
        gfx.closePath();

        gfx.fillPath();
        gfx.strokePath();
    }
}
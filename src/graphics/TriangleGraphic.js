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
        const thickness = 2 / (cam.zoom || 1);
        
        let colorVal = 0xff8400;
        if (typeof config.color === 'number') {
            colorVal = config.color;
        } else if (typeof config.color === 'string') {
            colorVal = Phaser.Display.Color.HexStringToColor(config.color).color;
        }

        const alphaVal = config.alpha !== undefined ? config.alpha : 1.0;
        const intensity = config.intensity ?? 1.0;

        // 3. SIZE CALCULATION
        let s = 25;
        if (config.radius !== undefined) {
            s = config.radius;
        } else if (config.size !== undefined) {
            s = config.size > 20 ? config.size / 2 : config.size * GRID.UNIT * intensity;
        } else if (config.width !== undefined) {
            s = config.width / 2;
        }

        // 4. DRAW
        // We draw relative to local (0,0), which BaseGraphic has already moved to the Player's position.
        gfx.fillStyle(colorVal, alphaVal);
        gfx.lineStyle(thickness, 0xffffff, alphaVal);

        gfx.beginPath();
        gfx.moveTo(s, 0);       // Tip (Right)
        gfx.lineTo(-s, -s);     // Top Back
        gfx.lineTo(-s, s);      // Bottom Back
        gfx.closePath();

        gfx.fillPath();
        gfx.strokePath();
    }
}
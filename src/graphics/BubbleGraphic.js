import { BaseGraphic } from './BaseGraphic';
import { GRID } from '../core/Constants';

export class BubbleGraphic extends BaseGraphic {
    create(config) {
        const sprite = this.scene.add.sprite(0, 0, 'bubble_sheet', config.frame || 0);

        // Scale to match Game Units
        const targetPixelSize = (config.size || 1) * GRID.UNIT * 2;
        const scaleX = targetPixelSize / sprite.width;
        const scaleY = targetPixelSize / sprite.height;
        const finalScale = Math.min(scaleX, scaleY);

        sprite.setScale(finalScale);

        return sprite;
    }

    onUpdate(config) {
        if (config.animate && this.gameObject) {
            // CONFIG: 1/4 second loop (250ms)
            // 8 Frames total.
            // 250ms / 8 = 31.25ms per frame.

            const loopDuration = 250;
            const totalFrames = 8;
            const msPerFrame = loopDuration / totalFrames;

            const currentFrame = Math.floor(Date.now() / msPerFrame) % totalFrames;

            this.gameObject.setFrame(currentFrame);
        }
    }
}
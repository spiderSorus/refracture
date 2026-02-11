const { Platform } = require('../ecs/components');

module.exports = {
    // Logic when state changes
    onFrameChange: (eid, oldFrame, newFrame) => {
        // console.log(`Platform ${eid} frame changed: ${oldFrame} -> ${newFrame}`);
    },

    // Main Draw Loop called by RenderSystem
    update: (g, eid, frame, PPU, dt) => {
        g.clear();

        // 1. Get Dimensions from Component
        const w = Platform.width[eid] * PPU;
        const h = Platform.height[eid] * PPU;

        // 2. Draw Centered
        g.rect(-w / 2, -h / 2, w, h);

        // 3. Style based on Frame (State)
        if (frame === 1) {
            g.fill(0xAAAAAA);
            g.stroke({ width: 4, color: 0x00FF00 });
        } else {
            g.fill(0x808080);
            g.stroke({ width: 2, color: 0xFFFFFF });
        }
    }
};
const { Position, Web } = require('../ecs/components');

module.exports = {
    update: (g, eid, frame, PPU, dt, world) => {
        g.clear();

        const a = Web.entityA[eid];
        const b = Web.entityB[eid];

        // Safety check: ensure both entities exist
        if (a === undefined || b === undefined) return;

        // Calculate relative coordinates
        // We subtract the Web's own position so that if the Web entity moves, 
        // the line stays pinned to the actual platforms.
        const ax = (Position.x[a] - Position.x[eid]) * PPU;
        const ay = (Position.y[a] - Position.y[eid]) * PPU;
        const bx = (Position.x[b] - Position.x[eid]) * PPU;
        const by = (Position.y[b] - Position.y[eid]) * PPU;

        // 1. Draw 1px White Line
        g.moveTo(ax, ay)
            .lineTo(bx, by)
            .stroke({ width: 1, color: 0xFFFFFF });

        // 2. Draw Anchor Points (Green Squares)
        const s = 4; // 4px square
        g.rect(ax - s / 2, ay - s / 2, s, s).fill(0x00FF00);
        g.rect(bx - s / 2, by - s / 2, s, s).fill(0x00FF00);
    }
};
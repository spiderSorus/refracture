const { defineQuery, addComponent, removeComponent, hasComponent } = require('bitecs');
const { Position, Platform, Input, Parent, WorldSpace } = require('../components');

const platformQuery = defineQuery([WorldSpace, Platform]);
const playerQuery = defineQuery([WorldSpace, Input]);

module.exports = function createPlatformSystem() {
    return (world) => {
        const platforms = platformQuery(world);
        const players = playerQuery(world);

        for (let i = 0; i < players.length; i++) {
            const eid = players[i];

            if (hasComponent(world, Parent, eid)) {
                const pid = Parent.eid[eid];
                const halfW = Platform.width[pid] / 2;
                const halfH = Platform.height[pid] / 2;

                // Allow player to be slightly above the platform (headroom)
                const topThreshold = -halfH - 20;

                if (Input.r2[eid] > 0.1) {
                    // Clamp to box if holding grip
                    Position.x[eid] = Math.max(-halfW, Math.min(halfW, Position.x[eid]));
                    Position.y[eid] = Math.max(-halfH, Math.min(halfH, Position.y[eid]));
                } else if (Math.abs(Position.x[eid]) > halfW ||
                    Position.y[eid] > halfH ||
                    Position.y[eid] < topThreshold) {

                    // Detach: Save current World Pos, then remove Parent
                    const wx = WorldSpace.x[eid];
                    const wy = WorldSpace.y[eid];

                    removeComponent(world, Parent, eid);

                    Position.x[eid] = wx;
                    Position.y[eid] = wy;
                    Parent.eid[eid] = 0;
                }
            } else {
                // Attach Logic
                for (let j = 0; j < platforms.length; j++) {
                    const pid = platforms[j];
                    const dx = Math.abs(WorldSpace.x[eid] - WorldSpace.x[pid]);
                    const dy = Math.abs(WorldSpace.y[eid] - WorldSpace.y[pid]);

                    // Check overlap
                    if (dx < Platform.width[pid] / 2 && dy < Platform.height[pid] / 2) {
                        addComponent(world, Parent, eid);
                        Parent.eid[eid] = pid;
                        // Convert World -> Local
                        Position.x[eid] = WorldSpace.x[eid] - WorldSpace.x[pid];
                        Position.y[eid] = WorldSpace.y[eid] - WorldSpace.y[pid];
                        break;
                    }
                }
            }
        }
    };
};
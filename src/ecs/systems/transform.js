const { defineQuery } = require('bitecs');
const { Position, WorldSpace, Parent } = require('../components');

const transformQuery = defineQuery([Position, WorldSpace]);

module.exports = function createTransformSystem() {
    return (world) => {
        const ents = transformQuery(world);
        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            const pid = Parent.eid[eid];

            if (pid !== undefined && pid !== 0) {
                // Child: World = ParentWorld + Local
                WorldSpace.x[eid] = WorldSpace.x[pid] + Position.x[eid];
                WorldSpace.y[eid] = WorldSpace.y[pid] + Position.y[eid];
            } else {
                // Root: World = Local
                WorldSpace.x[eid] = Position.x[eid];
                WorldSpace.y[eid] = Position.y[eid];
            }
        }
    };
};
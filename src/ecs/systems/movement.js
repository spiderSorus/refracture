const { defineQuery } = require('bitecs');
const { Position, Velocity } = require('../components');

const movementQuery = defineQuery([Position, Velocity]);

module.exports = function createMovementSystem() {
    return (world, elapsedMS) => {
        const ents = movementQuery(world);
        const dt = elapsedMS / 1000; // Time in seconds

        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            Position.x[eid] += Velocity.x[eid] * dt;
            Position.y[eid] += Velocity.y[eid] * dt;
        }
    };
};
const { defineQuery } = require('bitecs');
const { Position, Velocity } = require('../components');

const movementQuery = defineQuery([Position, Velocity]);

module.exports = function createMovementSystem() {
    return (world, delta) => {
        const entities = movementQuery(world);
        for (let i = 0; i < entities.length; i++) {
            const eid = entities[i];
            Position.x[eid] += Velocity.x[eid] * delta;
            Position.y[eid] += Velocity.y[eid] * delta;
        }
    };
};
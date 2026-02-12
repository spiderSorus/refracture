const { defineQuery } = require('bitecs');
const { Position, Velocity, Patrol } = require('../components');

const patrolQuery = defineQuery([Position, Velocity, Patrol]);

module.exports = function createPatrolSystem() {
    return (world, dt) => {
        const ents = patrolQuery(world);
        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            
            // Apply Velocity to Position (Local)
            Position.x[eid] += Velocity.x[eid] * dt;
            
            // Bounce Logic
            if (Position.x[eid] > Patrol.endX[eid] && Velocity.x[eid] > 0) Velocity.x[eid] *= -1;
            if (Position.x[eid] < Patrol.startX[eid] && Velocity.x[eid] < 0) Velocity.x[eid] *= -1;
        }
    };
};

const { defineQuery } = require('bitecs');
const { Position, Orbit, Velocity } = require('../components');

const orbitQuery = defineQuery([Position, Orbit]);

module.exports = function createOrbitSystem() {
    return (world, dt) => {
        const ents = orbitQuery(world);
        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            
            // 1. Advance Angle
            Orbit.angle[eid] += Orbit.speed[eid] * dt;
            
            // 2. Calculate PURE LOCAL Position (Relative to 0,0)
            // We do NOT add the center's position here. The TransformSystem handles that via Parenting.
            const oldX = Position.x[eid];
            const oldY = Position.y[eid];

            Position.x[eid] = Math.cos(Orbit.angle[eid]) * Orbit.radius[eid];
            Position.y[eid] = Math.sin(Orbit.angle[eid]) * Orbit.radius[eid];

            // 3. Calculate Velocity (Local Delta)
            Velocity.x[eid] = (Position.x[eid] - oldX) / dt;
            Velocity.y[eid] = (Position.y[eid] - oldY) / dt;
        }
    };
};

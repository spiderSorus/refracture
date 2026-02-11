const { defineQuery } = require('bitecs');
const { Position, Velocity, Mass } = require('../components');

// We want anything that has Mass, Position, and Velocity
const gravityQuery = defineQuery([Position, Velocity, Mass]);

const G = 500; // Gravitational Constant (Tweaked for game feel)
const MIN_DIST = 20; // Softening parameter to prevent shooting off to infinity

module.exports = function createGravitySystem() {
    return (world, dt) => {
        const ents = gravityQuery(world);

        // N-Body Simulation: Check every pair of objects
        for (let i = 0; i < ents.length; i++) {
            const e1 = ents[i];

            for (let j = i + 1; j < ents.length; j++) {
                const e2 = ents[j];

                const dx = Position.x[e2] - Position.x[e1];
                const dy = Position.y[e2] - Position.y[e1];
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);

                // Prevent division by zero or extreme forces at close range
                if (dist < MIN_DIST) continue;

                // F = G * m1 * m2 / r^2
                const f = (G * Mass.value[e1] * Mass.value[e2]) / distSq;

                // Normalize direction (dx/dist, dy/dist)
                const fx = (dx / dist) * f;
                const fy = (dy / dist) * f;

                // Apply Force to Velocity (a = F/m) -> (dv = a * dt)
                // Entity 1 is pulled TOWARDS Entity 2 (+)
                Velocity.x[e1] += (fx / Mass.value[e1]) * dt;
                Velocity.y[e1] += (fy / Mass.value[e1]) * dt;

                // Entity 2 is pulled TOWARDS Entity 1 (-) (Newton's 3rd Law)
                Velocity.x[e2] -= (fx / Mass.value[e2]) * dt;
                Velocity.y[e2] -= (fy / Mass.value[e2]) * dt;
            }
        }
    };
};
const { defineQuery, addComponent, removeComponent, hasComponent } = require('bitecs');
const { Position, Velocity, Platform, Input, Parent, Bouncing } = require('../components');

const platformQuery = defineQuery([Position, Velocity, Platform]);
const playerQuery = defineQuery([Position, Input]);

module.exports = function createPlatformSystem() {
    return (world, dt) => {
        const platforms = platformQuery(world);
        const players = playerQuery(world);

        // 1. Platform Behavior (ONLY IF TAGGED)
        for (let i = 0; i < platforms.length; i++) {
            const pid = platforms[i];

            // Only bounce if the platform has the Bouncing component
            if (hasComponent(world, Bouncing, pid)) {
                if (Position.x[pid] > 200 && Velocity.x[pid] > 0) Velocity.x[pid] *= -1;
                if (Position.x[pid] < 0 && Velocity.x[pid] < 0) Velocity.x[pid] *= -1;
            }
        }

        // 2. Player Logic (Carrying & Safety)
        for (let i = 0; i < players.length; i++) {
            const eid = players[i];

            if (hasComponent(world, Parent, eid)) {
                const pid = Parent.eid[eid];

                // A. Apply Platform Velocity (Carry)
                Position.x[eid] += Velocity.x[pid] * dt;
                Position.y[eid] += Velocity.y[pid] * dt;

                let localX = Position.x[eid] - Position.x[pid];
                let localY = Position.y[eid] - Position.y[pid];
                const halfW = Platform.width[pid] / 2;
                const halfH = Platform.height[pid] / 2;

                // B. Safety Mode (R2 Trigger)
                if (Input.r2[eid] > 0.1) {
                    Position.x[eid] = Position.x[pid] + Math.max(-halfW, Math.min(halfW, localX));
                    Position.y[eid] = Position.y[pid] + Math.max(-halfH, Math.min(halfH, localY));
                }
                else if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) {
                    // C. Normal Detach
                    removeComponent(world, Parent, eid);
                }

            } else {
                // D. Attach Logic
                for (let j = 0; j < platforms.length; j++) {
                    const pid = platforms[j];
                    const dx = Math.abs(Position.x[eid] - Position.x[pid]);
                    const dy = Math.abs(Position.y[eid] - Position.y[pid]);
                    if (dx < Platform.width[pid] / 2 && dy < Platform.height[pid] / 2) {
                        addComponent(world, Parent, eid);
                        Parent.eid[eid] = pid;
                        break;
                    }
                }
            }
        }
    };
};
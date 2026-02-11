const { defineQuery } = require('bitecs');
const { Velocity, Input } = require('../components');
const { PLAYER_SPEED } = require('../../constants');

const inputQuery = defineQuery([Input, Velocity]);

module.exports = function createInputSystem() {
    return (world) => {
        const ents = inputQuery(world);
        const gamepads = navigator.getGamepads();

        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            const gp = gamepads[Input.index[eid]];

            if (gp) {
                // Movement
                const threshold = 0.15;
                const lx = gp.axes[0];
                const ly = gp.axes[1];
                Velocity.x[eid] = Math.abs(lx) > threshold ? lx * PLAYER_SPEED : 0;
                Velocity.y[eid] = Math.abs(ly) > threshold ? ly * PLAYER_SPEED : 0;

                // Triggers (R2 is button 7 on standard gamepads)
                // If keyboard override is needed later, we can map Shift/Ctrl here too.
                const r2 = gp.buttons[7] ? gp.buttons[7].value : 0;
                Input.r2[eid] = r2;
            }
        }
    };
};

const { defineQuery } = require('bitecs');
const { Keyboard } = require('../components');

const keyboardQuery = defineQuery([Keyboard]);

module.exports = function createDebugSystem(state) {
    let lastPress = false;

    return (world) => {
        const ents = keyboardQuery(world);
        if (ents.length === 0) return;

        const eid = ents[0];
        // Toggle Debug with 'X' (88)
        const isPressed = Keyboard.keys[eid][88];

        if (isPressed && !lastPress) {
            state.debug = !state.debug;
        }
        lastPress = isPressed;
    };
};
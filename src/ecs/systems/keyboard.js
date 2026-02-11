const { defineQuery } = require('bitecs');
const { Keyboard } = require('../components');

const keyboardQuery = defineQuery([Keyboard]);

module.exports = function createKeyboardSystem() {
    const keyMap = {};

    window.addEventListener('keydown', (e) => {
        keyMap[e.code] = 1;
        // Prevent scrolling with arrows
        if (['ArrowUp', 'ArrowDown', 'Space', 'Enter'].includes(e.code)) e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
        keyMap[e.code] = 0;
    });

    return (world) => {
        const ents = keyboardQuery(world);
        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];

            // Map standard keys to array indices
            Keyboard.keys[eid][32] = keyMap['Space'] || 0;
            Keyboard.keys[eid][13] = keyMap['Enter'] || 0; // Enter
            Keyboard.keys[eid][38] = keyMap['ArrowUp'] || 0; // Up
            Keyboard.keys[eid][40] = keyMap['ArrowDown'] || 0; // Down
            Keyboard.keys[eid][88] = keyMap['KeyX'] || 0; // 'X' key
        }
    };
};
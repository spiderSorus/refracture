const { Velocity } = require('../components');

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

module.exports = function createInputSystem(playerEid) {
    return () => {
        const speed = 5;
        Velocity.x[playerEid] = (keys['ArrowRight'] ? speed : 0) - (keys['ArrowLeft'] ? speed : 0);
        Velocity.y[playerEid] = (keys['ArrowDown'] ? speed : 0) - (keys['ArrowUp'] ? speed : 0);
    };
};
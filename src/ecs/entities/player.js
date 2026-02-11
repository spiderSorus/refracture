const { addEntity, addComponent } = require('bitecs');
const { Position, Velocity, Graphic, Input } = require('../components');
const { UNIT_SIZE } = require('../../constants');

module.exports = function createPlayer(world, x, y) {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    addComponent(world, Graphic, eid);
    addComponent(world, Input, eid);

    Position.x[eid] = x;
    Position.y[eid] = y;
    Input.index[eid] = 0; // Gamepad index 0

    Graphic.shape[eid] = 0; // Circle
    Graphic.color[eid] = 0x00FFCC;
    Graphic.size[eid] = UNIT_SIZE; // 10 units

    return eid;
};
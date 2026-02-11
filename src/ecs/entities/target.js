const { addEntity, addComponent } = require('bitecs');
const { Position, Graphic, CameraTarget } = require('../components');
const { UNIT_SIZE } = require('../../constants');

module.exports = function createTarget(world, x, y) {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Graphic, eid);
    addComponent(world, CameraTarget, eid); // The camera will now track this too

    Position.x[eid] = x;
    Position.y[eid] = y;

    Graphic.shape[eid] = 1; // 1 = RECT
    Graphic.color[eid] = 0xFF0000; // Red
    Graphic.size[eid] = UNIT_SIZE;

    return eid;
};
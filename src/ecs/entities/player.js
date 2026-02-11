const { addEntity, addComponent } = require('bitecs');
const { Position, Velocity, Graphic } = require('../components');

module.exports = function createPlayer(world, x, y) {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    addComponent(world, Graphic, eid);

    Position.x[eid] = x;
    Position.y[eid] = y;
    Graphic.shape[eid] = 0;       // Circle
    Graphic.color[eid] = 0xffffff; // White
    Graphic.size[eid] = 20;

    return eid;
};
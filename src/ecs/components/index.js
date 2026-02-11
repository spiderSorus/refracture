const { defineComponent, f32, ui32, ui8 } = require('bitecs');

const Position = defineComponent({ x: f32, y: f32 });
const Velocity = defineComponent({ x: f32, y: f32 });
const Graphic = defineComponent({
    shape: ui8, // 0: Circle, 1: Rect
    color: ui32,
    size: f32
});

module.exports = { Position, Velocity, Graphic };
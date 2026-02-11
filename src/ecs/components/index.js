const { defineComponent, Types } = require('bitecs');

const Position = defineComponent({
    x: Types.f32,
    y: Types.f32
});

const Velocity = defineComponent({
    x: Types.f32,
    y: Types.f32
});

const Graphic = defineComponent({
    shape: Types.ui8,
    color: Types.ui32,
    size: Types.f32
});

module.exports = { Position, Velocity, Graphic };
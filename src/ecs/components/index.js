const { defineComponent, Types } = require('bitecs');

const Position = defineComponent({ x: Types.f32, y: Types.f32 });
const Velocity = defineComponent({ x: Types.f32, y: Types.f32 });
const Input = defineComponent({ index: Types.ui8 });
const Graphic = defineComponent({
    shape: Types.ui8,
    color: Types.ui32,
    size: Types.f32
});

const Debug = defineComponent();
const CameraTarget = defineComponent();

module.exports = {
    Position,
    Velocity,
    Graphic,
    Input,
    Debug,
    CameraTarget
};
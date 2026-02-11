const { defineComponent, Types } = require('bitecs');
const Graphic = defineComponent({ 
    // Legacy (Shapes)
    shape: Types.ui8, 
    color: Types.ui32, 
    size: Types.f32,
    // New (Controllers)
    controllerId: Types.ui8,
    frame: Types.ui16,
    lastFrame: Types.ui16
});
module.exports = { Graphic };

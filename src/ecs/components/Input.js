const { defineComponent, Types } = require('bitecs');
const Input = defineComponent({ 
    index: Types.ui8,
    r2: Types.f32  // New: Stores trigger value (0.0 - 1.0)
});
module.exports = { Input };

const { defineComponent, Types } = require('bitecs');
const Patrol = defineComponent({ 
    startX: Types.f32, 
    endX: Types.f32, 
    speed: Types.f32 
});
module.exports = { Patrol };

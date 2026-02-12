const { defineComponent, Types } = require('bitecs');
const Orbit = defineComponent({ 
    centerEid: Types.eid, 
    radius: Types.f32, 
    speed: Types.f32, 
    angle: Types.f32 
});
module.exports = { Orbit };

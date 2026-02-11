const { defineComponent, Types } = require('bitecs');
const Web = defineComponent({ 
    entityA: Types.eid,
    entityB: Types.eid,
    anchorAX: Types.f32,
    anchorAY: Types.f32,
    anchorBX: Types.f32,
    anchorBY: Types.f32
});
module.exports = { Web };

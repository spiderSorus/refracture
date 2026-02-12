const { defineComponent, Types } = require('bitecs');

const Web = defineComponent({
    entityA: Types.eid, // Platform A
    entityB: Types.eid  // Platform B
});

module.exports = { Web };
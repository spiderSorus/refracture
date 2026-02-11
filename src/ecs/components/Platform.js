const { defineComponent, Types } = require('bitecs');

const Platform = defineComponent({
    width: Types.f32,
    height: Types.f32
});

module.exports = { Platform };
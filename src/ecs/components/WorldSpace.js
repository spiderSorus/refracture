// src/ecs/components/WorldSpace.js
const { defineComponent, Types } = require('bitecs');
const WorldSpace = defineComponent({ x: Types.f32, y: Types.f32 });
module.exports = { WorldSpace };
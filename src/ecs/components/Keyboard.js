const { defineComponent, Types } = require('bitecs');
const Keyboard = defineComponent({ keys: [Types.ui8, 256] });
module.exports = { Keyboard };

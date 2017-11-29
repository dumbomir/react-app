'use strict';

const preset = require('babel-preset-react-app');

module.exports = Object.assign({}, preset, {
  presets: preset.presets.map((x, i) => {
    if (i === 0) {
      return [
        x[0],
        {
          targets: {
            node: 'current',
          },
        },
      ];
    }
    return x;
  }),
});

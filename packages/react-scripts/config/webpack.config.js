'use strict';

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const paths = require('./paths');

module.exports = function({ env }) {
  const appConfig =
    env === 'production'
      ? require('./webpack.config.prod')
      : require('./webpack.config.dev');

  const serverConfig = Object.assign({}, appConfig, {
    name: 'server',
    target: 'node',

    entry: paths.serverServerJs,

    output: Object.assign({}, appConfig.output, {
      path: paths.serverBuild,
      filename: 'server.js',
      libraryTarget: 'commonjs2',
    }),

    // Modify babel-preset-react-app settings
    module: Object.assign({}, appConfig.module, {
      rules: appConfig.module.rules.map(rule => {
        if (rule.oneOf) {
          return Object.assign({}, rule, {
            oneOf: rule.oneOf.map(x => {
              if (x.loader === require.resolve('babel-loader')) {
                return Object.assign({}, x, {
                  options: Object.assign({}, x.options, {
                    presets: [path.join(__dirname, 'babel-preset.js')],
                    compact: false,
                  }),
                });
              }
              return x;
            }),
          });
        }
        return rule;
      }),
    }),

    // Remove plugins that are not required in server-side bundle
    plugins: appConfig.plugins.filter(
      x =>
        !(
          x instanceof InterpolateHtmlPlugin ||
          x instanceof HtmlWebpackPlugin ||
          x instanceof webpack.optimize.UglifyJsPlugin ||
          x instanceof SWPrecacheWebpackPlugin
        )
    ),

    externals: [nodeExternals()],
  });

  return [appConfig, serverConfig];
};

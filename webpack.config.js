const glob = require('glob');
const path = require('path');
const { UserscriptPlugin } = require('webpack-userscript');

/**
 * @typedef {import("webpack").Configuration} Configuration
 * @typedef {import("webpack").RuleSetRule} RuleSetRule
 * @typedef {import("webpack-userscript/dist").UserscriptOptions} UserscriptOptions
 * @typedef {import("webpack-userscript/dist/features").HeadersOption} HeadersOption
 */

const dev = process.env.NODE_ENV === 'development';

/** @type {RuleSetRule[]} */
let rules = [];

/** @type {UserscriptOptions} */
let userscriptOptions = {
  headers(original) {
    /** @type {HeadersOption} */
    const headersOption = {
      ...original,
      author: 'RatserX',
      description: 'Alternate explorer for the Steam Discovery Queue',
      icon: 'https://store.steampowered.com/favicon.ico',
      match: ['http://store.steampowered.com/explore*', 'https://store.steampowered.com/explore*'],
      name: 'Steam Discovery Queue Explorer',
      namespace: 'https://github.com/RatserX/steam-discovery-queue-explorer',
      downloadURL:
        'https://github.com/RatserX/steam-discovery-queue-explorer/raw/main/dist/sdqe.user.js',
      updateURL:
        'https://github.com/RatserX/steam-discovery-queue-explorer/raw/main/dist/sdqe.meta.js',
    };

    if (dev) headersOption.version = `${original.version}-build.[buildNo]`;
    return headersOption;
  },
};

if (!dev) {
  rules = [
    ...rules,
    {
      test: /\.m?js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: '> 0.25%, not dead',
              },
            ],
          ],
        },
      },
    },
  ];
} else {
  userscriptOptions = {
    ...userscriptOptions,
    proxyScript: {
      filename: '[basename].proxy.user.js',
    },
  };
}

/** @type {Configuration} */
module.exports = {
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
  entry: glob.sync('./src/**/*.js'),
  mode: dev ? 'development' : 'production',
  module: {
    rules: rules,
  },
  output: {
    filename: 'sdqe.user.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new UserscriptPlugin(userscriptOptions)],
};

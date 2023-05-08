const glob = require('glob');
const path = require('path');
const { UserscriptPlugin } = require('webpack-userscript');

const dev = process.env.NODE_ENV === 'development';

module.exports = {
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
  entry: glob.sync('./src/*.js'),
  mode: dev ? 'development' : 'production',
  module: {
    rules: [
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
    ],
  },
  output: {
    filename: 'sdqe.user.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new UserscriptPlugin({
      headers(original) {
        /** @type {import('webpack-userscript/dist/features').HeadersOption} */
        const headersOption = {
          ...original,
          author: 'RatserX',
          description: 'Alternate explorer for the Steam Discovery Queue',
          icon: 'https://store.steampowered.com/favicon.ico',
          match: [
            'http://store.steampowered.com/explore*',
            'https://store.steampowered.com/explore*',
          ],
          name: 'Steam Discovery Queue Explorer',
          namespace: 'https://github.com/RatserX/steam-discovery-queue-explorer',
          downloadURL:
            'https://github.com/RatserX/steam-discovery-queue-explorer/raw/main/dist/sdqe.user.js',
          updateURL:
            'https://github.com/RatserX/steam-discovery-queue-explorer/raw/main/dist/sdqe.user.js',
        };

        if (dev) {
          return {
            ...headersOption,
            version: `${original.version}-build.[buildNo]`,
          };
        }

        return headersOption;
      },
    }),
  ],
};

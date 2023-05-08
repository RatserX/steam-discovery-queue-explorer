import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/sdqe.user.js',
  output: {
    file: 'dist/sdqe.user.js',
    format: 'cjs',
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
    }),
    terser({
      format: {
        comments: 'all',
      },
    }),
  ],
};

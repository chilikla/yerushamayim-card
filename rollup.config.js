import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import images from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'src/card/yerushamayim-card-local.js',
    output: {
      file: 'dist/yerushamayim-card-local.js',
      format: 'iife',
      plugins: terser({
        ecma: 2020,
        mangle: { toplevel: true },
        compress: {
          module: true,
          toplevel: true,
          unsafe_arrows: true,
          drop_console: false,
          drop_debugger: true
        },
        output: { quote_style: 1 }
      })
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      images(),
      copy({
        targets: [
          { src: 'src/assets/logo.png', dest: 'dist/assets' },
          { src: 'src/assets/logo_night.png', dest: 'dist/assets' }
        ]
      })
    ]
  },
  {
    input: 'src/card/yerushamayim-card.js',
    output: {
      file: 'dist/yerushamayim-card.js',
    },
    external: ['https://unpkg.com/lit-element@2.0.1/lit-element.js?module']
  }
];
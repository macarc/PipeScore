import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/PipeScore.ts',
  output: {
    file: './public/dist/PipeScore.js',
    format: 'iife'
  },
  watch: {
    include: './src/**',
    chokidar: {
      paths: './src/**',
      usePolling: true
    }
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve(),
    terser(),
  ]
}

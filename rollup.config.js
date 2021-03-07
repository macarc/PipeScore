import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const makeCfg = (folder,file) => ({
  input: `./src/${folder}/${file}.ts`,
  output: {
    file: `./public/dist/${file}.js`,
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
});

export default [makeCfg('PipeScore', 'PipeScore'), makeCfg('Login', 'login'), makeCfg('Scores','scores')]

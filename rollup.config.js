// import { terser } from 'rollup-plugin-terser';
// import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
// import postcss from 'rollup-plugin-postcss';
import less from 'rollup-plugin-less';

export default {
  input: 'src/index.ts',
  output: [{
    file: 'dist/step-guidance.min.js',
    name: 'StepGuidance',
    format: 'iife',
  }, {
   file: 'dist/step-guidance.umd.js',
   name: 'StepGuidance',
   format: 'umd',
   }],
  plugins: [
    // postcss({
    //   extensions: ['.css'],
    // }),
    less({
      insert: true,
      output: false,
    }),
    typescript(),
    // babel({
    //   exclude: 'node_modules/**',
    // }),
    // terser(),
  ],
};

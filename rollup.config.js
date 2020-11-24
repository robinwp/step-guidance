// import { terser } from 'rollup-plugin-terser';
// import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
// import postcss from 'rollup-plugin-postcss';
import less from 'rollup-plugin-less';

export default {
  input: 'src/index.ts',
  output: [{
    file: 'dist/stepGuidance.min.js',
    name: 'stepGuidance',
    format: 'iife',
  }/*, {
   file: 'dist/ai-rule-parser.umd.js',
   name: 'aiRuleParser',
   format: 'umd',
   }*/],
  plugins: [
    // postcss({
    //   extensions: ['.css'],
    // }),
    less({
      insert: true,
    }),
    typescript(),
    // babel({
    //   exclude: 'node_modules/**',
    // }),
    // terser(),
  ],
};

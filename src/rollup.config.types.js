import dts from 'rollup-plugin-dts'
import postcss from 'rollup-plugin-postcss'
import alias from '@rollup/plugin-alias';
import path from 'path';

export default {
  input: './index.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [
    postcss({
      autoModules: true,
      include: '**/*.css',
      extensions: ['.css'],
      plugins: [],
    }),
    dts({
      compilerOptions: {
        baseUrl: '.',
      },
    }),
  ],
}

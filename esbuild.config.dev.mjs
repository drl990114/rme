import * as esbuild from 'esbuild'
import cssModulesPlugin from 'esbuild-css-modules-plugin'
import fs from 'fs'

const ctx = await esbuild.context({
  entryPoints: ['./src/index-dev.tsx'],
  bundle: true,
  outdir: 'build',
  treeShaking: true,
  logLevel: 'info',
  loader: {
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.ttf': 'dataurl',
    '.svg': 'dataurl',
    '.eot': 'dataurl',
  },
  plugins: [
  ],
})

fs.existsSync('./build') || fs.mkdirSync('./build')

fs.copyFile('./public/index.html', './build/index.html', (err) => {
  if (err) throw err
})

await ctx.watch()
await ctx.serve({
  servedir: 'build',
  port: 3000,
  host: 'localhost',
})

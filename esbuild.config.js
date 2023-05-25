const path = require('path')
const esbuild = require('esbuild')
const version = require('./package.json').version
const entryPoint = './src/index.ts'
const outDir = './lib'
const outFile = 'bundle.js'

esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  format: 'esm',
  minify: true,
  outfile: path.join(outDir, outFile),
  globalName: 'myLib',
  define: { // 设置全局变量名为 VERSION，
    VERSION: JSON.stringify(version),
  },
}).then(() => {
  console.warn(`Build succeeded. Output file: ${path.join(outDir, outFile)}`)
}).catch((e) => {
  console.error(`Build failed: ${e.message}`)
  process.exit(1)
})

const esbuild = require('esbuild');
const fs = require('node:fs');

const buildOptions = [
  {
    entryPoints: ['src/main.ts', 'src/preload.ts'],
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    target: 'node16',
    format: 'cjs',
    sourcemap: true,
    minify: false,
    external: ['electron'],
  },
  {
    entryPoints: ['src/renderer.ts'],
    bundle: true,
    outfile: 'dist/renderer.js',
    platform: 'browser',
    target: 'es2020',
    format: 'iife',
    sourcemap: true,
    minify: false,
  },
];

const copyIndexHtml = () => {
  fs.mkdirSync('dist', { recursive: true });
  fs.copyFileSync('src/index.html', 'dist/index.html');
};

// Build function
const build = async () => {
  try {
    await Promise.all(buildOptions.map((opt) => esbuild.build(opt)));
    copyIndexHtml();
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};

// Watch function for development
const watch = async () => {
  const contexts = await Promise.all(buildOptions.map((opt) => esbuild.context(opt)));
  await Promise.all(contexts.map((ctx) => ctx.watch()));
  copyIndexHtml();
  console.log('Watching for changes...');
};

// Export for use in package.json scripts
module.exports = { build, watch, buildOptions };

// Run build if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--watch')) {
    watch();
  } else {
    build();
  }
}

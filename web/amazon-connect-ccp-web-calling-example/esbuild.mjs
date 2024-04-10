import esbuild from 'esbuild';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

const buildOptions = {
  entryPoints: ['src/MyApp.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'esm',
  outfile: 'dist/main.js',
  plugins: [nodeModulesPolyfillPlugin()],
};

const startDevServer = async () => {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  const { host, port } = await context.serve({
    servedir: './',
    port: 5500,
    host: 'localhost',
  });
  console.log(`Server running at http://${host}:${port}`);
};

if (process.argv.includes('--watch')) {
  await startDevServer();
} else {
  await esbuild.build(buildOptions);
}

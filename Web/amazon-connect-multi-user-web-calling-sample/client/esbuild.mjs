/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import * as esbuild from "esbuild";
import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";

// Main app build options
const buildOptions = {
  entryPoints: ["index.js"],
  bundle: true,
  outfile: "dist/bundle.js",
  sourcemap: true,
  format: "esm",
  plugins: [nodeModulesPolyfillPlugin()],
};

if (process.argv.includes("--watch")) {
  // Development build with watch mode
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();

  // Start local server
  const { host, port } = await ctx.serve({
    servedir: ".",
    port: 8000,
  });

  console.log(`Development server running at http://${host}:${port}`);
} else {
  // Production build
  await esbuild.build(buildOptions);
  console.log("Build complete");
}

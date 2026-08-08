import esbuild from "esbuild";

const isProduction = process.argv.includes("--production");
const isWatching = process.argv.includes("--watch");

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian"],
  format: "cjs",
  platform: "node",
  target: "es2020",
  logLevel: "info",
  sourcemap: isProduction ? false : "inline",
  minify: isProduction,
  outfile: "main.js"
});

if (isWatching) {
  await context.watch();
  console.log("Watching for changes...");
} else {
  await context.rebuild();
  await context.dispose();
}


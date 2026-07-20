import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, ".vercel", "output");
const funcDir = path.join(outputDir, "functions", "api.func");

console.log("Starting Vercel Build Output API generation...");

// 1. Clean output directory
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(funcDir, { recursive: true });

// 2. Build the API bundle using esbuild JS API
console.log("Bundling API with esbuild...");
const esbuild = await import("esbuild");

// Node.js built-in modules that must NOT be bundled
const nodeBuiltins = [
  "assert", "buffer", "child_process", "cluster", "console", "constants",
  "crypto", "dgram", "dns", "domain", "events", "fs", "http", "http2",
  "https", "module", "net", "os", "path", "perf_hooks", "process",
  "punycode", "querystring", "readline", "repl", "stream", "string_decoder",
  "sys", "timers", "tls", "tty", "url", "util", "v8", "vm", "wasi",
  "worker_threads", "zlib",
];
// Also handle node: prefixed imports
const externals = [
  "onnxruntime-node",
  ...nodeBuiltins,
  ...nodeBuiltins.map((m) => `node:${m}`),
];

const result = await esbuild.build({
  entryPoints: [path.join(__dirname, "apps", "api", "src", "vercel-entry.ts")],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: path.join(funcDir, "index.mjs"),
  external: externals,
  banner: {
    js: [
      `import { createRequire as __esmCreateRequire } from 'module';`,
      `const require = (typeof globalThis.require !== 'undefined') ? globalThis.require : __esmCreateRequire(import.meta.url);`,
    ].join("\n"),
  },
  logLevel: "info",
});

if (result.errors.length > 0) {
  console.error("esbuild errors:", result.errors);
  process.exit(1);
}

// 3. Copy ML models and assets
console.log("Copying ML models and metadata assets...");
const mlSrcDir = path.join(__dirname, "apps", "api", "src", "ml");
const files = fs.readdirSync(mlSrcDir);
for (const file of files) {
  if (file.endsWith(".onnx") || file.endsWith(".onnx.data") || file.endsWith(".json")) {
    fs.copyFileSync(path.join(mlSrcDir, file), path.join(funcDir, file));
    console.log(`Copied: ${file}`);
  }
}

// Copy onnxruntime-node native binaries
const srcBinDir = path.join(__dirname, "node_modules", "onnxruntime-node", "bin");
const destBinDir = path.join(funcDir, "node_modules", "onnxruntime-node", "bin");
if (fs.existsSync(srcBinDir)) {
  console.log("Copying onnxruntime-node native binaries...");
  fs.mkdirSync(destBinDir, { recursive: true });
  const copyRecursive = (src, dest) => {
    if (fs.statSync(src).isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const file of fs.readdirSync(src)) {
        copyRecursive(path.join(src, file), path.join(dest, file));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  copyRecursive(srcBinDir, destBinDir);

  // Copy onnxruntime-node package.json so createRequire can resolve it
  const ortPkgPath = path.join(funcDir, "node_modules", "onnxruntime-node", "package.json");
  const ortSrcPkg = path.join(__dirname, "node_modules", "onnxruntime-node", "package.json");
  if (fs.existsSync(ortSrcPkg)) {
    fs.copyFileSync(ortSrcPkg, ortPkgPath);
  }
  console.log("Copied onnxruntime-node native binaries successfully!");
}

// 4. Write .vc-config.json for the serverless function
console.log("Writing .vc-config.json...");
fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      handler: "index.mjs",
      runtime: "nodejs22.x",
      launcherType: "Nodejs",
      shouldAddHelpers: false
    },
    null,
    2
  )
);

// 5. Write config.json for the Vercel routing
console.log("Writing config.json...");
fs.writeFileSync(
  path.join(outputDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        {
          src: "/(.*)",
          dest: "/api"
        }
      ]
    },
    null,
    2
  )
);

console.log("Vercel Build Output API generation complete!");

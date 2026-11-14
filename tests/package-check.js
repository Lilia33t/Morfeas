#!/usr/bin/env node
// Package check: every file the app needs is present, in the folder and
// (optionally) in a zip made for upload or review.
//
//   node tests/package-check.js                 checks the repository folder
//   node tests/package-check.js morfeas.zip     also checks that the zip holds every file
//   node tests/package-check.js morfeas.zip --upload
//                                               the zip is an upload of changed files only:
//                                               checks the files that change with every version
//
// Exits with code 1 and lists what is missing.
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const problems = [];

// 1. Everything the service worker caches for offline use.
const sw = read("sw.js");
const shell = (sw.match(/const APP_SHELL = \[([\s\S]*?)\];/) || [])[1] || "";
const shellFiles = [...shell.matchAll(/"\.\/([^"]*)"/g)].map((m) => m[1]).filter(Boolean);

// 2. Local scripts, styles, icons and the manifest named in index.html.
const html = read("index.html");
const htmlFiles = [...html.matchAll(/(?:src|href)="([^"#?:]+)"/g)].map((m) => m[1]).filter((u) => !/^https?:/.test(u));

// 3. Icons named in the manifest.
const manifest = JSON.parse(read("manifest.webmanifest"));
const iconFiles = (manifest.icons || []).map((i) => i.src);

// 4. Files that belong in every full package.
const repoFiles = [
  "README.md", "LICENSE", "sw.js", "index.html", "manifest.webmanifest",
  "src/data.js", "src/formulas.js", "src/primitives.js", "src/tabs.js", "src/root.js",
  "tests/run-tests.js", "tests/audit-check.js", "tests/package-check.js", "tests/ui-360.mjs",
  "audit/audit-registry.json", "audit/AUDIT.md", "audit/CALC-MODES.md",
  "fonts/commissioner.woff", "fonts/OFL-Commissioner.txt"
];

const all = [...new Set([...shellFiles, ...htmlFiles, ...iconFiles, ...repoFiles])].sort();
for (const f of all) if (!fs.existsSync(path.join(ROOT, f))) problems.push("missing in folder: " + f);

// 5. Version numbers agree.
const appVersion = (read("src/data.js").match(/const APP_VERSION = (\d+);/) || [])[1];
const cache = (sw.match(/const CACHE = "anesthesia-v(\d+)";/) || [])[1];
if (!appVersion || appVersion !== cache) problems.push("APP_VERSION (" + appVersion + ") and sw.js CACHE (" + cache + ") differ");

// 6. Optional zip.
const zip = process.argv[2];
if (zip) {
  let names = [];
  try {
    names = execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" }).split("\n").map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    problems.push("cannot read zip " + zip + " (is 'unzip' installed?)");
  }
  const upload = process.argv.includes("--upload");
  // An upload carries what changes with every version; a full package carries everything.
  const needed = upload
    ? ["sw.js", "index.html", "README.md", "src/data.js", "src/formulas.js", "src/primitives.js", "src/tabs.js", "src/root.js", "tests/run-tests.js", "audit/audit-registry.json", "audit/AUDIT.md"]
    : all;
  for (const f of needed) if (names.length && !names.includes(f)) problems.push("missing in zip: " + f);
}

if (problems.length) {
  console.log("Package check FAILED:\n  - " + problems.join("\n  - "));
  process.exit(1);
}
console.log("Package check OK: " + all.length + " files" + (zip ? " · zip " + path.basename(zip) + " complete" : "") + " · version " + appVersion);

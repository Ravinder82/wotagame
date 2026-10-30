// Splice .tmp-hailstorm.js (the Hailstorm Run implementation) into both runtime
// copies, then syntax-check them. Usage: node scripts/build-runtime.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "game-runtime.js"), "utf8");
const idx = src.indexOf("function hailstorm(){");
if (idx < 0) throw new Error("hailstorm marker not found in game-runtime.js");

const frag = readFileSync(path.join(root, ".tmp-hailstorm.js"), "utf8");
const DISPATCH = '\nif(CFG.game==="higher")higher();else if(CFG.game==="memory")memory();else if(CFG.game==="wordfinder")wordfinder();else if(CFG.game==="hailstorm")hailstorm();else reaction();';
const out = src.slice(0, idx) + frag + DISPATCH;

if (/<\/script/i.test(out)) throw new Error("runtime contains a </script sequence");
if (!out.includes("hailstorm()")) throw new Error("dispatch missing");

for (const target of ["game-runtime.js", "lib/game-runtime.js"]) {
  writeFileSync(path.join(root, target), out);
}
execFileSync(process.execPath, ["--check", path.join(root, "game-runtime.js")]);
execFileSync(process.execPath, ["--check", path.join(root, "lib/game-runtime.js")]);
console.log("built", out.length, "bytes; both runtimes in sync and syntax-clean");
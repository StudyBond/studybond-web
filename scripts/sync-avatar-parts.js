/* eslint-disable @typescript-eslint/no-require-imports */
/* Copies the shared avatar definition from the backend, which owns it.
   `node scripts/sync-avatar-parts.js --check` only compares, and exits 1 when
   the web copy is out of date. Never edit the web copy by hand. */
const fs = require("fs");
const path = require("path");

const source = path.resolve(__dirname, "../../studybond-backend/src/modules/avatar/avatar-parts.json");
const target = path.resolve(__dirname, "../src/features/avatar/avatar-parts.json");
const checkOnly = process.argv.includes("--check");

if (!fs.existsSync(source)) {
  console.error(`[avatar:sync] Missing backend avatar parts at ${source}`);
  process.exit(1);
}

const wanted = fs.readFileSync(source, "utf8");
const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;

if (checkOnly) {
  if (current !== wanted) {
    console.error("[avatar:sync] The web copy of avatar-parts.json differs from the backend. Run node scripts/sync-avatar-parts.js");
    process.exit(1);
  }
  console.log("[avatar:sync] Up to date.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, wanted);
console.log(`[avatar:sync] Copied backend avatar parts to ${target}`);

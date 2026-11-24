/* eslint-disable @typescript-eslint/no-require-imports */
/*
 * Refreshes src/lib/premium/plans.fallback.json from the live backend's
 * public board list. That file is only used when the backend cannot be
 * reached while the site is being built, so the build still shows the
 * last-known prices. Run after changing a price in the admin:
 *
 *   npm run premium:sync                      # https://api.studybond.app
 *   npm run premium:sync -- http://localhost:5000
 *
 * Read-only: it only GETs the public board list.
 */
const fs = require("fs");
const path = require("path");

const base = (process.argv[2] || "https://api.studybond.app").replace(/\/$/, "");
const target = path.resolve(__dirname, "../src/lib/premium/plans.fallback.json");

async function main() {
  const response = await fetch(`${base}/api/institutions`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${base}/api/institutions answered ${response.status}`);
  const json = await response.json();

  const boards = (json?.data?.boards ?? [])
    .filter((b) => b && typeof b.code === "string" && b.premium && b.premium.priceNaira > 0 && b.premium.durationMonths > 0)
    .map((b) => ({
      code: b.code,
      name: b.name,
      examName: b.examName,
      status: b.status,
      priceNaira: b.premium.priceNaira,
      durationMonths: b.premium.durationMonths,
    }));

  if (boards.length === 0) {
    throw new Error("No board had a premium price. Is the backend on the version that sends prices?");
  }

  const current = JSON.parse(fs.readFileSync(target, "utf8"));
  fs.writeFileSync(
    target,
    `${JSON.stringify({ _note: current._note, syncedAt: new Date().toISOString(), boards }, null, 2)}\n`,
  );
  console.log(`[premium:sync] Saved ${boards.length} board price(s) from ${base}:`);
  for (const b of boards) console.log(`  ${b.code} (${b.status}): N${b.priceNaira} for ${b.durationMonths} months`);
}

main().catch((error) => {
  console.error(`[premium:sync] ${error.message}. The old copy was kept.`);
  process.exit(1);
});

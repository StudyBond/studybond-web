/* eslint-disable @typescript-eslint/no-require-imports */
/*
 * Puts Satoshi's official web font files in public/fonts, unchanged.
 *
 * Why not commit them: this repo is public, and Satoshi's licence (ITF FFL,
 * section 02) forbids making the font files available through a repository
 * or any publicly accessible server. Self-hosting them on studybond.app is
 * allowed. So the build downloads Fontshare's official zip and copies the two
 * variable woff2 files out of it byte for byte: no subsetting, converting or
 * renaming, which the licence also forbids.
 *
 * This never fails the build. If Fontshare can't be reached, the screens use
 * Plus Jakarta Sans until the next build. Runs before `next build` and
 * `next dev` (prebuild/predev in package.json); skips when the files exist.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ZIP_URL = "https://api.fontshare.com/v2/fonts/download/satoshi";
const WANTED = {
  "Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2": "Satoshi-Variable.woff2",
  "Satoshi_Complete/Fonts/WEB/fonts/Satoshi-VariableItalic.woff2": "Satoshi-VariableItalic.woff2",
};
const OUT_DIR = path.resolve(__dirname, "../public/fonts");

function log(message) {
  console.log(`[fetch-satoshi] ${message}`);
}

/** Reads the named entries out of a zip buffer (stored or deflate only). */
function extractEntries(zip, names) {
  const EOCD = 0x06054b50;
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i -= 1) {
    if (zip.readUInt32LE(i) === EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip file");

  const count = zip.readUInt16LE(eocd + 10);
  let offset = zip.readUInt32LE(eocd + 16);
  const found = {};
  for (let entry = 0; entry < count; entry += 1) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) throw new Error("bad central directory");
    const method = zip.readUInt16LE(offset + 10);
    const compressedSize = zip.readUInt32LE(offset + 20);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const localOffset = zip.readUInt32LE(offset + 42);
    const name = zip.toString("utf8", offset + 46, offset + 46 + nameLength);

    if (names.includes(name)) {
      if (zip.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("bad local header");
      const localName = zip.readUInt16LE(localOffset + 26);
      const localExtra = zip.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localName + localExtra;
      const data = zip.subarray(start, start + compressedSize);
      if (method === 0) found[name] = Buffer.from(data);
      else if (method === 8) found[name] = zlib.inflateRawSync(data);
      else throw new Error(`unsupported compression ${method} for ${name}`);
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return found;
}

async function main() {
  const targets = Object.values(WANTED).map((file) => path.join(OUT_DIR, file));
  if (targets.every((file) => fs.existsSync(file))) {
    log("already in public/fonts");
    return;
  }

  log(`downloading ${ZIP_URL}`);
  const response = await fetch(ZIP_URL, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`download failed: HTTP ${response.status}`);
  const zip = Buffer.from(await response.arrayBuffer());

  const entries = extractEntries(zip, Object.keys(WANTED));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [entry, file] of Object.entries(WANTED)) {
    if (!entries[entry]) throw new Error(`${entry} is not in the zip any more`);
    fs.writeFileSync(path.join(OUT_DIR, file), entries[entry]);
    log(`wrote public/fonts/${file} (${entries[entry].length} bytes)`);
  }
}

main().catch((error) => {
  log(`skipped: ${error.message}. The screens use Plus Jakarta Sans instead.`);
});

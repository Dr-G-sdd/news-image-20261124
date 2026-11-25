// news-image-20261124 entry (Node 22, standard library only).
// Reads the entry image beside this file, checks it is a real PNG
// within the gate's limits, and writes it to the output directory
// as entry.png, where the judge reads it.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1024 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

const image = readFileSync(source);

if (!image.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file (bad magic bytes)');
}
if (image.length > MAX_BYTES) {
  throw new Error(`entry.png is ${image.length} bytes, over the 1 MiB limit`);
}

// PNG dimensions live in the IHDR chunk: width at bytes 16-19 and
// height at bytes 20-23, both big-endian.
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}
console.log(`entry.png is a valid PNG, ${width}x${height}, ${image.length} bytes`);

mkdirSync(outDir, { recursive: true });
writeFileSync(target, image);

if (!existsSync(target)) {
  throw new Error(`failed to write ${target}`);
}
console.log(`wrote ${target} (${image.length} bytes)`);

// Propagate the root package.json "version" to every workspace package.json,
// so the monorepo version is defined in exactly one place: the repository root.
//
// Usage:
//   node scripts/sync-version.mjs          # write root version to all packages
//   node scripts/sync-version.mjs --check  # exit 1 if any package is out of sync (no writes)
//
// Internal dependencies use `workspace:*` and are rewritten to the concrete
// version at publish time by pnpm, so only the top-level "version" field is touched here.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Directories that never participate in version sync.
// `templates`/`fixtures` hold scaffolding consumed by end users and must keep
// their own placeholder versions rather than inheriting the framework version.
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.turbo',
  'templates',
  'fixtures',
  '__fixtures__',
]);

/** Recursively collect every package.json path under `dir`, skipping SKIP_DIRS. */
function findPackageJsonFiles(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findPackageJsonFiles(join(dir, entry.name), found);
    } else if (entry.name === 'package.json') {
      found.push(join(dir, entry.name));
    }
  }
  return found;
}

const checkOnly = process.argv.includes('--check');

const rootPkgPath = join(repoRoot, 'package.json');
const rootVersion = JSON.parse(readFileSync(rootPkgPath, 'utf8')).version;
if (!rootVersion) {
  console.error('✖ root package.json has no "version" field');
  process.exit(1);
}

// Only the FIRST `"version": "..."` (the top-level field) is replaced; nested
// keys in package.json never use the literal key `version`.
const versionField = /("version"\s*:\s*)"[^"]*"/;

const targets = findPackageJsonFiles(repoRoot).filter((file) => file !== rootPkgPath);

const updated = [];
const drift = [];

for (const file of targets) {
  const raw = readFileSync(file, 'utf8');
  const match = raw.match(versionField);
  const rel = relative(repoRoot, file);

  if (!match) {
    // A package without a top-level version cannot be kept in sync; surface it.
    console.error(`✖ ${rel} has no top-level "version" field`);
    process.exit(1);
  }

  const current = match[0].slice(match[1].length).replace(/^"|"$/g, '');
  if (current === rootVersion) continue;

  drift.push({ rel, current });
  if (!checkOnly) {
    writeFileSync(file, raw.replace(versionField, `$1"${rootVersion}"`));
    updated.push(rel);
  }
}

if (checkOnly) {
  if (drift.length === 0) {
    console.log(`✔ all ${targets.length} packages match root version ${rootVersion}`);
    process.exit(0);
  }
  console.error(`✖ ${drift.length} package(s) out of sync with root version ${rootVersion}:`);
  for (const { rel, current } of drift) console.error(`  → ${rel} (${current})`);
  console.error('  run: pnpm sync-version');
  process.exit(1);
}

if (updated.length === 0) {
  console.log(`✔ already in sync — all ${targets.length} packages at ${rootVersion}`);
} else {
  console.log(`✔ synced ${updated.length} package(s) to ${rootVersion}:`);
  for (const rel of updated) console.log(`  → ${rel}`);
}

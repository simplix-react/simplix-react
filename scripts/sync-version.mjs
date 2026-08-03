// Propagate the root package.json "version" to every workspace package.json,
// so the monorepo version is defined in exactly one place: the repository root.
//
// Usage:
//   node scripts/sync-version.mjs               # write root version to all packages
//   node scripts/sync-version.mjs --check       # exit 1 if any package is out of sync (no writes)
//   node scripts/sync-version.mjs --set X.Y.Z   # set the root version, then propagate it
//
// Internal dependencies use `workspace:*` and are rewritten to the concrete
// version at publish time by pnpm, so only the top-level "version" field is touched here.
//
// `--set` also moves CHANGELOG.md in step with the version, so the top section can
// never drift from what was actually published: setting a release version stamps the
// `Unreleased` heading with that version and today's date, and setting the next
// -SNAPSHOT version opens a fresh `Unreleased` section above it.

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
const setIndex = process.argv.indexOf('--set');
const setVersion = setIndex !== -1 ? process.argv[setIndex + 1] : null;

// Only the FIRST `"version": "..."` (the top-level field) is replaced; nested
// keys in package.json never use the literal key `version`.
const versionField = /("version"\s*:\s*)"[^"]*"/;

const rootPkgPath = join(repoRoot, 'package.json');
const changelogPath = join(repoRoot, 'CHANGELOG.md');

// The first `## [x.y.z] - <label>` heading in CHANGELOG.md is the section the next
// release ships; everything below it is already published.
const topHeading = /^## \[[^\]]+\] - (.+)$/m;

/** Stamp the pending `Unreleased` heading with the version and date being released. */
function stampChangelogRelease(version) {
  const raw = readFileSync(changelogPath, 'utf8');
  const match = raw.match(topHeading);
  if (!match || match[1].trim() !== 'Unreleased') {
    console.error(`✖ CHANGELOG.md has no "Unreleased" section to release as ${version}`);
    console.error('  add one before releasing: ## [<version>] - Unreleased');
    process.exit(1);
  }
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(changelogPath, raw.replace(topHeading, `## [${version}] - ${date}`));
  console.log(`✔ stamped CHANGELOG.md section as ${version} (${date})`);
}

/** Open an empty `Unreleased` section for the development version just set. */
function openChangelogSection(version) {
  const raw = readFileSync(changelogPath, 'utf8');
  const match = raw.match(topHeading);
  if (match && match[1].trim() === 'Unreleased') {
    console.log('✔ CHANGELOG.md already has an Unreleased section');
    return;
  }
  if (!match) {
    console.error('✖ CHANGELOG.md has no version section to insert above');
    process.exit(1);
  }
  writeFileSync(changelogPath, raw.replace(topHeading, `## [${version}] - Unreleased\n\n${match[0]}`));
  console.log(`✔ opened CHANGELOG.md section [${version}] - Unreleased`);
}

// `--set` moves the single source of truth, then falls through to the same
// propagation, so the release flow can retarget the version in one command.
if (setVersion) {
  if (checkOnly) {
    console.error('✖ --set cannot be combined with --check');
    process.exit(1);
  }
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(setVersion)) {
    console.error(`✖ --set expects a semver version, got "${setVersion ?? ''}"`);
    process.exit(1);
  }
  const rootRaw = readFileSync(rootPkgPath, 'utf8');
  if (!versionField.test(rootRaw)) {
    console.error('✖ root package.json has no "version" field to set');
    process.exit(1);
  }
  writeFileSync(rootPkgPath, rootRaw.replace(versionField, `$1"${setVersion}"`));
  console.log(`✔ set root version to ${setVersion}`);

  const snapshot = setVersion.endsWith('-SNAPSHOT');
  if (snapshot) openChangelogSection(setVersion.slice(0, -'-SNAPSHOT'.length));
  else stampChangelogRelease(setVersion);
}

const rootVersion = JSON.parse(readFileSync(rootPkgPath, 'utf8')).version;
if (!rootVersion) {
  console.error('✖ root package.json has no "version" field');
  process.exit(1);
}

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

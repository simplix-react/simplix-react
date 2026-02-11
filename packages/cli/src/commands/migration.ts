import { Command } from "commander";
import { resolve, join } from "node:path";
import { readdir } from "node:fs/promises";
import { log } from "../utils/logger.js";
import { pathExists, writeFileWithDir } from "../utils/fs.js";
import pc from "picocolors";

export const migrationCommand = new Command("migration").description(
  "Database migration management",
);

migrationCommand
  .command("create <name>")
  .description("Create a new migration file")
  .requiredOption("--domain <domain>", "Domain package name")
  .action(async (name: string, flags: { domain: string }) => {
    const rootDir = resolve(process.cwd());

    // Find the domain package
    const packagesDir = join(rootDir, "packages");
    if (!(await pathExists(packagesDir))) {
      log.error("No packages/ directory found. Run from a simplix project root.");
      process.exit(1);
    }

    const entries = await readdir(packagesDir, { withFileTypes: true });
    const domainPkg = entries.find(
      (e) => e.isDirectory() && e.name.endsWith(`-domain-${flags.domain}`),
    );

    if (!domainPkg) {
      log.error(`Domain package for "${flags.domain}" not found`);
      process.exit(1);
    }

    const migrationsDir = join(
      packagesDir,
      domainPkg.name,
      "src",
      "mock",
      "migrations",
    );

    // Generate timestamp: YYYYMMDDHHMMSS
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);

    // kebab-case the name
    const kebabName = name
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "");
    const fileName = `${timestamp}-${kebabName}.ts`;
    const filePath = join(migrationsDir, fileName);

    const template = `import type { PGlite } from "@electric-sql/pglite";

export async function up(db: PGlite): Promise<void> {
  await db.query(\`
    -- ALTER TABLE ...
  \`);
}

export async function down(db: PGlite): Promise<void> {
  await db.query(\`
    -- ALTER TABLE ...
  \`);
}
`;

    await writeFileWithDir(filePath, template);
    console.log(pc.green(`✔ Created migration: ${fileName}`));
  });

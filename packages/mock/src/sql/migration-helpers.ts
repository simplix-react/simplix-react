import type { PGlite } from "@electric-sql/pglite";

/**
 * Checks whether a table exists in the database by querying `information_schema.tables`.
 *
 * @param db - The PGlite instance.
 * @param tableName - The name of the table to check.
 * @returns `true` if the table exists, `false` otherwise.
 *
 * @example
 * ```ts
 * import { initPGlite, tableExists } from "@simplix-react/mock";
 *
 * const db = await initPGlite("idb://project-mock");
 * if (!(await tableExists(db, "tasks"))) {
 *   await db.query("CREATE TABLE tasks (id TEXT PRIMARY KEY)");
 * }
 * ```
 */
export async function tableExists(db: PGlite, tableName: string): Promise<boolean> {
  const result = await db.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = $1
    ) as exists`,
    [tableName],
  );
  return result.rows[0]?.exists ?? false;
}

/**
 * Checks whether a column exists in a table by querying `information_schema.columns`.
 *
 * @param db - The PGlite instance.
 * @param tableName - The table to inspect.
 * @param columnName - The column name to check for.
 * @returns `true` if the column exists, `false` otherwise.
 *
 * @example
 * ```ts
 * import { initPGlite, columnExists } from "@simplix-react/mock";
 *
 * const db = await initPGlite("idb://project-mock");
 * const has = await columnExists(db, "tasks", "priority");
 * ```
 */
export async function columnExists(
  db: PGlite,
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const result = await db.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2
    ) as exists`,
    [tableName, columnName],
  );
  return result.rows[0]?.exists ?? false;
}

/**
 * Executes multiple SQL statements separated by semicolons.
 *
 * Splits the input on `;`, trims each statement, filters out empty strings,
 * and executes them sequentially.
 *
 * @param db - The PGlite instance.
 * @param sql - A string containing one or more semicolon-separated SQL statements.
 *
 * @example
 * ```ts
 * import { initPGlite, executeSql } from "@simplix-react/mock";
 *
 * const db = await initPGlite("idb://project-mock");
 * await executeSql(db, `
 *   CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL);
 *   CREATE TABLE tasks (id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id));
 * `);
 * ```
 */
export async function executeSql(db: PGlite, sql: string): Promise<void> {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await db.query(stmt);
  }
}

/**
 * Adds a column to a table only if it does not already exist.
 *
 * Combines {@link columnExists} with an `ALTER TABLE ADD COLUMN` statement
 * for safe, idempotent schema migrations.
 *
 * @param db - The PGlite instance.
 * @param tableName - The target table.
 * @param columnName - The column name to add.
 * @param columnDef - The column type definition (e.g. `"TEXT NOT NULL DEFAULT ''"`).
 *
 * @example
 * ```ts
 * import { initPGlite, addColumnIfNotExists } from "@simplix-react/mock";
 *
 * const db = await initPGlite("idb://project-mock");
 * await addColumnIfNotExists(db, "tasks", "priority", "INTEGER DEFAULT 0");
 * ```
 *
 * @see {@link columnExists} - Used internally to check existence.
 */
export async function addColumnIfNotExists(
  db: PGlite,
  tableName: string,
  columnName: string,
  columnDef: string,
): Promise<void> {
  const exists = await columnExists(db, tableName, columnName);
  if (!exists) {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
  }
}

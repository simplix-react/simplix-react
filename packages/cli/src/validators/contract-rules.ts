import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { pathExists } from "../utils/fs.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * Contract Rules:
 * - All entities must have schema + operations
 * - All top-level operations must have input + output
 * - All entities must have mock handler config
 *
 * Only applies to packages with defineApi() usage.
 */
export async function validateContractRules(
  pkgDir: string,
  result: ValidationResult,
  _options?: { fix?: boolean },
): Promise<void> {
  const contractPath = await findContractFile(pkgDir);
  if (!contractPath) return;

  const contractContent = await readFile(contractPath, "utf-8");

  // Verify this file actually uses defineApi
  if (!contractContent.includes("defineApi(")) return;

  const entityNames = extractEntityNames(contractContent);
  if (entityNames.length === 0) return;

  // Check entity schema completeness
  validateEntitySchemas(contractContent, entityNames, result);

  // Check top-level operation completeness
  validateTopLevelOperations(contractContent, result);

  // Check mock handler config
  await validateMockHandlers(pkgDir, entityNames, result);
}

async function findContractFile(pkgDir: string): Promise<string | null> {
  const candidates = [
    join(pkgDir, "src", "api", "contract.ts"),
    join(pkgDir, "src", "contract.ts"),
    join(pkgDir, "src", "generated", "contract.ts"),
  ];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Extract a balanced brace block starting after the opening brace.
 * Returns the content between (exclusive) the braces,
 * or null if the block is not found.
 */
function extractBalancedBlock(content: string, startIdx: number): string | null {
  let depth = 1;
  let i = startIdx;

  while (i < content.length && depth > 0) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    i++;
  }

  if (depth !== 0) return null;
  return content.slice(startIdx, i - 1);
}

/**
 * Count brace depth at a position within a string.
 */
function depthAt(content: string, endIdx: number): number {
  let depth = 0;
  for (let i = 0; i < endIdx; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
  }
  return depth;
}

function extractEntityNames(content: string): string[] {
  // Find the entities: { block using depth counting
  const entitiesStart = content.match(/entities\s*:\s*\{/);
  if (!entitiesStart) return [];

  const blockStart = entitiesStart.index! + entitiesStart[0].length;
  const entitiesBlock = extractBalancedBlock(content, blockStart);
  if (!entitiesBlock) return [];

  const names: string[] = [];

  // Only match top-level keys inside the entities block (depth 0)
  const keyPattern = /(\w+)\s*:\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = keyPattern.exec(entitiesBlock)) !== null) {
    if (depthAt(entitiesBlock, match.index) === 0) {
      names.push(match[1]);
    }
  }

  return names;
}

function validateEntitySchemas(
  content: string,
  entityNames: string[],
  result: ValidationResult,
): void {
  const requiredFields = ["schema", "operations"];
  let allComplete = true;

  for (const entityName of entityNames) {
    const entityBlock = extractEntityBlockInEntities(content, entityName);
    if (!entityBlock) continue;

    for (const field of requiredFields) {
      const hasField = new RegExp(`${field}\\s*:`).test(entityBlock);
      if (!hasField) {
        result.errors.push(
          `Contract: Entity "${entityName}" missing ${field}`,
        );
        allComplete = false;
      }
    }
  }

  if (allComplete) {
    result.passes.push("Contract: All entities have complete schemas");
  }
}

/**
 * Extract an entity block from within the entities section.
 * Uses depth-counting to handle nested braces correctly.
 */
function extractEntityBlockInEntities(
  content: string,
  entityName: string,
): string | null {
  // Find within the entities block to avoid matching wrong keys
  const entitiesStart = content.match(/entities\s*:\s*\{/);
  if (!entitiesStart) return null;

  const blockStart = entitiesStart.index! + entitiesStart[0].length;
  const entitiesBlock = extractBalancedBlock(content, blockStart);
  if (!entitiesBlock) return null;

  const startPattern = new RegExp(`${entityName}\\s*:\\s*\\{`);
  const startMatch = startPattern.exec(entitiesBlock);
  if (!startMatch) return null;

  const entityBlockStart = startMatch.index + startMatch[0].length;
  return extractBalancedBlock(entitiesBlock, entityBlockStart);
}

/**
 * Validate top-level operations (standalone, not inside entities).
 * These are the operations property at the same level as entities in defineApi.
 */
function validateTopLevelOperations(
  content: string,
  result: ValidationResult,
): void {
  // Find defineApi({ to locate the config object
  const defineApiMatch = content.match(/defineApi\s*\(\s*\{/);
  if (!defineApiMatch) return;

  const configStart = defineApiMatch.index! + defineApiMatch[0].length;
  const configBlock = extractBalancedBlock(content, configStart);
  if (!configBlock) return;

  // Find top-level operations key in the config block (depth 0)
  let operationsBlock: string | null = null;
  const opsPattern = /operations\s*:\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = opsPattern.exec(configBlock)) !== null) {
    if (depthAt(configBlock, match.index) === 0) {
      // This is a top-level operations block
      const opBlockStart = match.index + match[0].length;
      operationsBlock = extractBalancedBlock(configBlock, opBlockStart);
      break;
    }
  }

  if (!operationsBlock) return;

  const opNames: string[] = [];
  const keyPattern = /(\w+)\s*:\s*\{/g;
  let opMatch: RegExpExecArray | null;
  while ((opMatch = keyPattern.exec(operationsBlock)) !== null) {
    if (depthAt(operationsBlock, opMatch.index) === 0) {
      opNames.push(opMatch[1]);
    }
  }

  if (opNames.length === 0) return;

  const requiredFields = ["input", "output"];
  let allComplete = true;

  for (const opName of opNames) {
    const opStartPattern = new RegExp(`${opName}\\s*:\\s*\\{`);
    const opStartMatch = opStartPattern.exec(operationsBlock);
    if (!opStartMatch) continue;

    const opBlockStart = opStartMatch.index + opStartMatch[0].length;
    const opBlock = extractBalancedBlock(operationsBlock, opBlockStart);
    if (!opBlock) continue;

    for (const field of requiredFields) {
      const hasField = new RegExp(`${field}\\s*:`).test(opBlock);
      if (!hasField) {
        result.errors.push(
          `Contract: Operation "${opName}" missing ${field}`,
        );
        allComplete = false;
      }
    }
  }

  if (allComplete) {
    result.passes.push("Contract: All operations have input + output");
  }
}

async function validateMockHandlers(
  pkgDir: string,
  entityNames: string[],
  result: ValidationResult,
): Promise<void> {
  // Check multiple possible handler locations
  const handlerCandidates = [
    join(pkgDir, "src", "mock", "handlers.ts"),
    join(pkgDir, "src", "mock", "generated", "handlers.ts"),
  ];

  let handlersPath: string | null = null;
  for (const candidate of handlerCandidates) {
    if (await pathExists(candidate)) {
      handlersPath = candidate;
      break;
    }
  }

  if (!handlersPath) {
    result.warnings.push(
      "Contract: No mock handlers file found (src/mock/handlers.ts)",
    );
    return;
  }

  const handlersContent = await readFile(handlersPath, "utf-8");

  // If using deriveMockHandlers with .config, all entities are derived from the contract
  if (handlersContent.includes("deriveMockHandlers") && handlersContent.includes(".config")) {
    result.passes.push("Contract: All entities have mock handler config (derived from contract)");
    return;
  }

  if (!handlersContent.includes("deriveMockHandlers")) {
    result.warnings.push(
      "Contract: handlers.ts does not use deriveMockHandlers",
    );
    return;
  }

  let allConfigured = true;

  for (const entityName of entityNames) {
    const hasConfig = new RegExp(`${entityName}\\s*:\\s*\\{`).test(
      handlersContent,
    );
    if (!hasConfig) {
      result.errors.push(
        `Contract: Entity "${entityName}" has no mock handler config`,
      );
      allConfigured = false;
    }
  }

  if (allConfigured) {
    result.passes.push("Contract: All entities have mock handler config");
  }
}

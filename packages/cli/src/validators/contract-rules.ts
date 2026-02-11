import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { pathExists } from "../utils/fs.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * Contract Rules:
 * - All entities must have schema + createSchema + updateSchema
 * - All operations must have input + output
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

  // Check operation completeness
  validateOperations(contractContent, result);

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

function extractEntityNames(content: string): string[] {
  // Match entities block: entities: { name: { ... }, name2: { ... } }
  const entitiesMatch = content.match(
    /entities\s*:\s*\{([\s\S]*?)\}\s*,?\s*(?:operations|$|\})/,
  );
  if (!entitiesMatch) return [];

  const entitiesBlock = entitiesMatch[1];
  const names: string[] = [];

  // Match top-level keys: `name: {` or `name:{`
  const keyPattern = /(\w+)\s*:\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = keyPattern.exec(entitiesBlock)) !== null) {
    names.push(match[1]);
  }

  return names;
}

function validateEntitySchemas(
  content: string,
  entityNames: string[],
  result: ValidationResult,
): void {
  const requiredFields = ["schema", "createSchema", "updateSchema"];
  let allComplete = true;

  for (const entityName of entityNames) {
    const entityBlock = extractEntityBlock(content, entityName);
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

function extractEntityBlock(
  content: string,
  entityName: string,
): string | null {
  const startPattern = new RegExp(`${entityName}\\s*:\\s*\\{`);
  const startMatch = startPattern.exec(content);
  if (!startMatch) return null;

  const startIdx = startMatch.index + startMatch[0].length;
  let depth = 1;
  let i = startIdx;

  while (i < content.length && depth > 0) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    i++;
  }

  return content.slice(startIdx, i - 1);
}

function validateOperations(
  content: string,
  result: ValidationResult,
): void {
  const operationsMatch = content.match(
    /operations\s*:\s*\{([\s\S]*?)\}\s*,?\s*\}/,
  );
  if (!operationsMatch) return;

  const operationsBlock = operationsMatch[1];

  const opNames: string[] = [];
  const keyPattern = /(\w+)\s*:\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = keyPattern.exec(operationsBlock)) !== null) {
    opNames.push(match[1]);
  }

  if (opNames.length === 0) return;

  const requiredFields = ["input", "output"];
  let allComplete = true;

  for (const opName of opNames) {
    const opBlock = extractEntityBlock(content, opName);
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

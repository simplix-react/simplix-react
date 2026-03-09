import { describe, it, expect } from "vitest";
import {
  extractMutatorStrategy,
  generateDomainMutatorContent,
} from "../openapi/orchestration/orval-runner.js";

describe("extractMutatorStrategy", () => {
  it("returns strategy string from getMutator call", () => {
    const content = `
import { getMutator } from "@simplix-react/api";

export async function customFetch<T>(url: string, options: RequestInit): Promise<T> {
  return getMutator("boot")<T>(url, options);
}
`;
    expect(extractMutatorStrategy(content)).toBe("boot");
  });

  it("returns undefined for default getMutator() with no args", () => {
    const content = `
import { getMutator } from "@simplix-react/api";

export async function customFetch<T>(url: string, options: RequestInit): Promise<T> {
  return getMutator()<T>(url, options);
}
`;
    expect(extractMutatorStrategy(content)).toBeUndefined();
  });

  it("returns undefined when getMutator is not found in content", () => {
    const content = `
export async function customFetch<T>(url: string, options: RequestInit): Promise<T> {
  return fetch(url, options).then(r => r.json());
}
`;
    expect(extractMutatorStrategy(content)).toBeUndefined();
  });

  it("extracts custom strategy name", () => {
    const content = 'return getMutator("nestjs")<T>(url, options);';
    expect(extractMutatorStrategy(content)).toBe("nestjs");
  });
});

describe("generateDomainMutatorContent", () => {
  it("generates default mutator content without strategy", () => {
    const content = generateDomainMutatorContent("project");
    expect(content).toContain('import { getMutator } from "@simplix-react/api"');
    expect(content).toContain("export async function customFetch<T>");
    expect(content).toContain("return getMutator()<T>(url, options);");
    expect(content).toContain("export type ErrorType<T = unknown> = Error & { data?: T };");
    expect(content).toContain("export type BodyType<T> = T;");
  });

  it("generates mutator content with strategy", () => {
    const content = generateDomainMutatorContent("project", "boot");
    expect(content).toContain('return getMutator("boot")<T>(url, options);');
  });

  it("generates mutator content with default strategy as empty call", () => {
    const content = generateDomainMutatorContent("project", "default");
    expect(content).toContain("return getMutator()<T>(url, options);");
  });

  it("generates mutator content with custom strategy name", () => {
    const content = generateDomainMutatorContent("project", "nestjs");
    expect(content).toContain('return getMutator("nestjs")<T>(url, options);');
  });
});

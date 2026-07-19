import { describe, expect, it } from "vitest";

import { buildQrMatrix, qrMatrixToPath } from "../qr-matrix";

describe("buildQrMatrix", () => {
  it("produces a square matrix with finder patterns", () => {
    const matrix = buildQrMatrix("https://example.test/k/abc123");

    expect(matrix.size).toBeGreaterThanOrEqual(21);
    expect(matrix.modules).toHaveLength(matrix.size * matrix.size);
    // Top-left finder pattern corner is always dark.
    expect(matrix.modules[0]).toBe(true);
  });

  it("varies with the encoded value", () => {
    const a = buildQrMatrix("token-a");
    const b = buildQrMatrix("token-b");
    expect(a.modules).not.toEqual(b.modules);
  });
});

describe("qrMatrixToPath", () => {
  it("emits one unit cell per dark module", () => {
    const matrix = buildQrMatrix("x");
    const path = qrMatrixToPath(matrix);
    const darkCount = matrix.modules.filter(Boolean).length;
    expect(path.match(/M\d+ \d+h1v1h-1z/g)).toHaveLength(darkCount);
  });
});

// verify-icons-data.ts
// D2 pre-implementation gate: measure lucide v1.12 icon-name intersection coverage
// Run: pnpm dlx tsx packages/ui/scripts/verify-icons-data.ts
// from /home/simplecore/dev/workspace/frontend/simplix-react/

import dynamicIconImports from "lucide-react/dist/esm/dynamicIconImports.mjs";
import { iconsData } from "../src/base/inputs/icon-picker/icons-data";

// Step 1: Build the lucide v1.12 key set
const lucideKeySet = new Set(Object.keys(dynamicIconImports));

// Step 2: Extract icon names from icons-data.ts
const iconNames: string[] = iconsData.map((icon) => icon.name);

// Step 3: Compute intersection and missing names
const present = iconNames.filter((name) => lucideKeySet.has(name));
const missing = iconNames.filter((name) => !lucideKeySet.has(name));

// Step 4: Compute loss rate
const totalCount = iconNames.length;
const missingCount = missing.length;
const lossRate = (missingCount / totalCount) * 100;

// Step 5: Output result
console.log(`Total icons in icons-data.ts: ${totalCount}`);
console.log(`Present in lucide v1.12: ${present.length}`);
console.log(`Missing from lucide v1.12: ${missingCount}`);
console.log(`Loss rate: ${lossRate.toFixed(2)}%`);
console.log(`\nMissing icon names:`);
missing.forEach((name) => console.log(`  - ${name}`));

// Step 6: PASS/FAIL gate
const LOSS_THRESHOLD_PERCENT = 5;
if (lossRate > LOSS_THRESHOLD_PERCENT) {
  console.error(`\nFAIL: loss rate ${lossRate.toFixed(2)}% exceeds threshold ${LOSS_THRESHOLD_PERCENT}%`);
  console.error("HITL escalation required — do NOT proceed to Stage-3 UI implementation.");
  process.exit(1);
} else {
  console.log(`\nPASS: loss rate ${lossRate.toFixed(2)}% <= ${LOSS_THRESHOLD_PERCENT}%`);
  console.log("Proceed to Stage-3 UI implementation.");
  process.exit(0);
}

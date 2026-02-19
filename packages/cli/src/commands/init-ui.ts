import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

import { Command } from "commander";
import ora from "ora";

import { pathExists, writeFileWithDir } from "../utils/fs.js";
import { log } from "../utils/logger.js";

const SHADCN_COMPONENTS = [
  "input",
  "textarea",
  "select",
  "switch",
  "checkbox",
  "badge",
  "calendar",
  "label",
] as const;

const uiProviderTemplate = `import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import type { UIComponents } from "@simplix-react/ui";

export const simplixUIComponents: UIComponents = {
  Input,
  Textarea,
  Label,
  Select: {
    Root: Select,
    Content: SelectContent,
    Item: SelectItem,
    Trigger: SelectTrigger,
    Value: SelectValue,
  },
  Switch,
  Checkbox,
  Badge,
  Calendar,
};
`;

export const initUiCommand = new Command("init-ui")
  .description("Initialize @simplix-react/ui with shadcn/ui integration")
  .option("-y, --yes", "Non-interactive mode")
  .action(async () => {
    const rootDir = resolve(process.cwd());
    const componentsJsonPath = join(rootDir, "components.json");

    // Check if shadcn is initialized
    if (!(await pathExists(componentsJsonPath))) {
      log.error(
        "components.json not found. Initialize shadcn first: npx shadcn@latest init",
      );
      process.exit(1);
    }

    const spinner = ora("Installing shadcn components...").start();

    try {
      // Install shadcn components using execFileSync (safe — no shell injection)
      execFileSync("npx", ["shadcn@latest", "add", ...SHADCN_COMPONENTS], {
        cwd: rootDir,
        stdio: "pipe",
      });

      spinner.text = "Generating UI provider setup...";

      // Generate UIProvider setup file
      const outputPath = join(rootDir, "src", "lib", "simplix-ui.ts");
      await writeFileWithDir(outputPath, uiProviderTemplate);

      spinner.succeed("@simplix-react/ui setup complete");

      log.info("");
      log.info("Generated:");
      log.step("src/lib/simplix-ui.ts — UIComponents configuration");
      log.info("");
      log.info("Next steps:");
      log.step(
        'Import simplixUIComponents from "@/lib/simplix-ui" in your app root',
      );
      log.step(
        "Wrap your app with <UIProvider components={simplixUIComponents}>",
      );
      log.info("");
    } catch (err) {
      spinner.fail("Failed to set up @simplix-react/ui");
      log.error(String(err));
      process.exit(1);
    }
  });

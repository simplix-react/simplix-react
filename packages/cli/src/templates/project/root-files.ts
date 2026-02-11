// Root-level project configuration templates

export const rootPackageJson = `{
  "name": "{{scope}}/{{projectName}}-monorepo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "packageManager": "pnpm@10.12.4",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --concurrency=15",
    "dev:watch": "turbo watch dev --concurrency=25",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "@simplix-react/cli": "{{fw.cli}}",
    "turbo": "{{deps.turbo}}",
    "typescript": "{{deps.typescript}}"
  }
}
`;

export const pnpmWorkspaceYaml = `packages:
  - "packages/*"
  - "modules/*"
  - "apps/*"
  - "config/*"
onlyBuiltDependencies:
  - esbuild
`;

export const turboJson = `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "dev:app": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "tsconfig.json"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
`;

export const rootTsconfigJson = `{
  "extends": "./config/typescript/base.json",
  "compilerOptions": {
    "declaration": false,
    "baseUrl": "."
  }
}
`;

export const gitignore = `node_modules/
dist/
.turbo/
*.tsbuildinfo
.idea/
.vscode/
.DS_Store
*.local
.env
.env.*
coverage/
`;

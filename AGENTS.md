# AGENTS.md

## Build & Test Commands

- **Build plugin (npm publish)**: `bun run build && bun run build:cli`
- **Build bundle (local install)**: `bun run build:bundle`
- **Build all**: `bun run build && bun run build:cli && bun run build:bundle`
- **Lint**: `bun run lint` (eslint)
- **Fix Lint**: `bun run lint:fix` (eslint --fix)
- **Format**: `bun run format` (prettier)
- **Test**: `bun test`

## Code Style Guidelines

### Imports & Module System

- Use ES6 `import`/`export` syntax (module: "ESNext", type: "module")
- Group imports: external libraries first, then internal modules
- Use explicit file extensions (`.ts`) for internal imports

### Formatting (Prettier)

- **Single quotes** (`singleQuote: true`)
- **Line width**: 100 characters
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 (no trailing commas in function parameters)
- **Semicolons**: enabled

### TypeScript & Naming

- **NeverNesters**: avoid deeply nested structures. Always exit early.
- **Strict mode**: enforced (`"strict": true`)
- **Classes**: PascalCase (e.g., `ModelFetcher`, `ModelCache`)
- **Methods/properties**: camelCase
- **Status strings**: use union types (e.g., `'pending' | 'running' | 'completed' | 'failed' | 'cancelled'`)
- **Explicit types**: prefer explicit type annotations over inference
- **Return types**: optional (not required but recommended for public methods)

### Error Handling

- Check error type before accessing error properties: `error instanceof Error ? error.toString() : String(error)`
- Log errors with `[ERROR]` prefix for consistency
- Always provide error context when recording output

### Linting Rules

- `@typescript-eslint/no-explicit-any`: warn (avoid `any` type)
- `no-console`: error (minimize console logs)
- `prettier/prettier`: error (formatting violations are errors)

## Testing

- Framework: **vitest** with `describe` & `it` blocks
- Style: Descriptive nested test cases with clear expectations
- Assertion library: `expect()` (vitest)

## Project Context

- **Type**: ES Module package for OpenCode plugin system
- **Target**: Bun runtime, ES2021+
- **Purpose**: Chutes AI models integration for OpenCode - access 58+ state-of-the-art AI models

## Directory Structure

```
chutes-plugin/
├── src/
│   ├── index.ts              # Main plugin entry point (ChutesPlugin)
│   ├── cli/                  # CLI commands for bunx chutes-plugin
│   │   ├── index.ts          # CAC CLI entry point
│   │   ├── install.ts        # install command (project/global)
│   │   ├── status.ts         # status command
│   │   ├── list.ts           # list models command
│   │   ├── refresh.ts        # refresh cache command
│   │   └── doctor.ts         # health check command
│   ├── models/
│   │   ├── index.ts          # ModelFetcher exports
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── fetcher.ts        # Model fetching with retry logic
│   │   ├── cache.ts          # TTL-based caching
│   │   └── registry.ts       # Model registry management
│   ├── tools/
│   │   └── index.ts          # Tool definitions (3 tools)
│   ├── config/
│   │   ├── index.ts          # Config exports
│   │   ├── schema.ts         # Config validation
│   │   └── auth.ts           # Auth file reading
│   └── __tests__/            # Unit tests
│       ├── cache.test.ts
│       ├── config.test.ts
│       └── registry.test.ts
├── dist/                     # Build output
│   ├── index.js              # Compiled plugin (npm)
│   ├── index.d.ts            # Type definitions
│   ├── bundle.js             # Bundled plugin (local install)
│   ├── cli/index.js          # Bundled CLI
│   ├── models/               # Compiled models
│   ├── tools/                # Compiled tools
│   └── config/               # Compiled config
├── bin/
│   └── chutes-plugin         # CLI wrapper script
└── test-local.ts             # Local API integration test
```

## Build Outputs

| File                | Purpose        | Usage                             |
| ------------------- | -------------- | --------------------------------- |
| `dist/index.js`     | Compiled (tsc) | Published to npm, uses ES imports |
| `dist/bundle.js`    | Bundled (bun)  | Local file-based install          |
| `dist/cli/index.js` | Bundled CLI    | Used by bunx chutes-plugin        |

## Local Development

### Testing Plugin Locally

1. Build the bundle:

   ```bash
   bun run build:bundle
   ```

2. Copy to test project:

   ```bash
   cp dist/bundle.js /path/to/test-project/.opencode/plugin/chutes-plugin.js
   ```

3. Run OpenCode:
   ```bash
   cd /path/to/test-project
   opencode
   ```

### CLI Testing

```bash
# Test from local source
node bin/chutes-plugin install

# Test via bunx
bunx chutes-plugin@latest install
```

### NPM Publishing

```bash
# Build everything
bun run build && bun run build:cli

# Publish to npm
npm publish
```

## Available Tools

- `chutes_list_models` - List available Chutes models with filtering
- `chutes_refresh_models` - Force refresh model list from API
- `chutes_status` - Check plugin status and cache info

**Note**: Chat functionality is handled natively by OpenCode when a Chutes model is selected from the dropdown.

## OpenCode Config Format

```json
{
  "plugin": ["chutes-plugin"],
  "provider": {
    "chutes": {
      "options": {
        "apiKey": "cpk_..."
      }
    }
  }
}
```

## Files to Clean/Ignore

- `dist-local.js` - Old build artifact, delete
- `simplest-plugin.js`, `simplest-plugin-bundled.js` - Test files, delete
- `test-plugin.js`, `test-plugin-bundled.js` - Test files, delete
- `.opencode/` - Test directory, safe to delete
- `.memory/` - Not used, delete if exists

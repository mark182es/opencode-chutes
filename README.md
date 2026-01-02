# chutes-plugin

Chutes Models Plugin for OpenCode - Access 58+ state-of-the-art AI models through the Chutes API.

> An OpenCode plugin that integrates Chutes AI models with dynamic synchronization and seamless OpenCode integration.

## Features

- **Dynamic Model Sync**: Automatically fetches latest models from `https://llm.chutes.ai/v1/models`
- **58+ Models**: Access reasoning, coding, vision, and general-purpose models
- **Conflict-Free Naming**: All models prefixed with `chutes/` to avoid conflicts
- **Intelligent Caching**: Model metadata cached for performance (1 hour TTL)
- **Comprehensive Tools**: `chutes_list_models`, `chutes_refresh_models`, `chutes_status`
- **CLI Support**: Install and manage the plugin with `bunx chutes-plugin`

## Available Models

The plugin provides access to models including:

### Reasoning Models

- `chutes/deepseek-ai/DeepSeek-R1` - Advanced reasoning model
- `chutes/deepseek-ai/DeepSeek-R1-0528-TEE` - Confidential compute reasoning
- `chutes/Qwen/Qwen3-235B-A22B-Thinking-2507` - Large-scale thinking model

### Coding Models

- `chutes/Qwen/Qwen2.5-Coder-32B-Instruct` - Specialized code generation
- `chutes/mistralai/Devstral-2-123B-Instruct-2512` - Devstral coding model
- `chutes/Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8-TEE` - Large code model

### Vision Models

- `chutes/Qwen/Qwen3-VL-235B-A22B-Instruct` - Vision-language model
- `chutes/unsloth/gemma-3-27b-it` - Multimodal Gemma
- `chutes/OpenGVLab/InternVL3-78B-TEE` - InternVL vision model

### General Purpose

- `chutes/Qwen/Qwen3-32B` - Balanced general model
- `chutes/deepseek-ai/DeepSeek-V3` - High-performance general model
- `chutes/NousResearch/Hermes-4-405B-FP8-TEE` - Large general model

## Installation

### Option 1: Using bunx (Recommended)

```bash
bunx chutes-plugin@latest install
```

This will install the plugin to your project (`.opencode/plugin/`) or globally based on your preference.

### Option 2: Manual Installation

Copy the bundled plugin to your OpenCode plugin directory:

```bash
# Project-level
cp dist/bundle.js /path/to/your/project/.opencode/plugin/chutes-plugin.js

# Global
cp dist/bundle.js ~/.config/opencode/plugin/chutes-plugin.js
```

### Option 3: npm (Coming Soon)

```bash
npm install chutes-plugin
```

Then add to your `opencode.json`:

```json
{
  "plugin": ["chutes-plugin"]
}
```

## Configuration

### OpenCode Config

Create or edit `opencode.json` in your project:

```json
{
  "plugin": ["chutes-plugin"],
  "provider": {
    "chutes": {
      "options": {
        "apiKey": "your-chutes-api-token"
      }
    }
  }
}
```

### Connect Your API Token

Use OpenCode's built-in `/connect` command to securely store your Chutes API token:

```
/connect chutes
```

Follow the prompts to enter your Chutes API token. The token will be securely stored in `~/.local/share/opencode/auth.json`.

Alternatively, you can manually create the auth file:

```json
{
  "chutes": {
    "type": "api",
    "key": "your-chutes-api-token-here"
  }
}
```

You can get your API token from [chutes.ai](https://chutes.ai).

## Usage

### Using Tools

#### List Available Models

```typescript
// List all models
await chutes_list_models({});

// Filter by provider
await chutes_list_models({
  owned_by: 'Qwen',
});

// Filter by feature
await chutes_list_models({
  feature: 'reasoning',
});

// Filter by name
await chutes_list_models({
  filter: 'DeepSeek',
});

// Show pricing
await chutes_list_models({
  show_pricing: true,
});
```

#### Refresh Model List

```typescript
// Refresh from API
await chutes_refresh_models({});

// Force refresh even if cache is valid
await chutes_refresh_models({
  force: true,
});
```

#### Check Plugin Status

```typescript
// Check cache status and model count
await chutes_status();
```

### CLI Commands

The plugin includes a CLI for management:

```bash
# Install the plugin
bunx chutes-plugin install

# Check plugin status
bunx chutes-plugin status

# List available models
bunx chutes-plugin list

# Refresh model cache
bunx chutes-plugin refresh

# Health check
bunx chutes-plugin doctor
```

## Model Pricing

Models are priced per 1 million tokens. Example pricing:

| Model                            | Input ($/1M) | Output ($/1M) |
| -------------------------------- | ------------ | ------------- |
| `chutes/Qwen/Qwen3-32B`          | $0.08        | $0.24         |
| `chutes/deepseek-ai/DeepSeek-R1` | $0.30        | $1.20         |
| `chutes/unsloth/gemma-3-4b-it`   | $0.01        | $0.03         |

Full pricing is available using the `chutes_list_models` tool.

## Architecture

```
src/
├── index.ts          # Main plugin entry point (ChutesPlugin)
├── cli/              # CLI commands
│   ├── index.ts      # CAC CLI entry point
│   ├── install.ts    # install command
│   ├── status.ts     # status command
│   ├── list.ts       # list models command
│   ├── refresh.ts    # refresh cache command
│   └── doctor.ts     # health check command
├── models/
│   ├── index.ts      # ModelFetcher exports
│   ├── types.ts      # TypeScript types
│   ├── fetcher.ts    # Model fetching with retry
│   ├── cache.ts      # Model caching (TTL-based)
│   └── registry.ts   # Model registry
├── tools/
│   └── index.ts      # Plugin tools (3 tools)
└── config/
    ├── index.ts      # Config exports
    ├── schema.ts     # Config validation
    └── auth.ts       # Auth file reading
```

## Development

### Build

```bash
# Build for npm publishing (compiled, not bundled)
bun run build

# Build CLI
bun run build:cli

# Build bundle for local installation
bun run build:bundle

# Build everything
bun run build && bun run build:cli && bun run build:bundle
```

### Test

```bash
bun test
```

### Lint

```bash
bun run lint
```

### Format

```bash
bun run format
```

## Publishing

### Version Bump

```bash
# Bump version (patch, minor, or major)
npm version patch     # 0.1.0 -> 0.1.1
npm version minor     # 0.1.0 -> 0.2.0
npm version major     # 0.1.0 -> 1.0.0
```

### Publish to npm

```bash
# Build first
bun run build && bun run build:cli

# Login to npm (first time only)
npm login

# Publish the package
npm publish
```

### Pre-release

```bash
# Create a beta release
npm version prerelease --preid=beta
npm publish --tag beta
```

## Troubleshooting

### "No API token configured"

Ensure you've connected your Chutes API token using the `/connect chutes` command or created `~/.local/share/opencode/auth.json` with your token.

### "Model not found"

Use `chutes_list_models` to see available models. Model IDs must be prefixed with `chutes/`.

### "Rate limit exceeded"

Wait a moment and retry. Consider reducing request frequency.

### Models not appearing

1. Check your API token is valid
2. Run `chutes_refresh_models({ force: true })`
3. Check plugin status with `chutes_status`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Mark182 <mark182@gmail.com>

## Repository

https://github.com/zenobi-us/opencode-chutes

## Chutes API

- Models API: `https://llm.chutes.ai/v1/models`
- Documentation: https://docs.chutes.ai

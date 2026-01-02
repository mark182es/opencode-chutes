# Chutes Plugin - Product Requirements Document (PRD)

## Overview

**Product Name:** Chutes Plugin for OpenCode

**Description:** An OpenCode plugin that integrates Chutes AI models, providing access to 48+ state-of-the-art language models through a unified interface. The plugin dynamically synchronizes available models from the Chutes API and enables seamless chat completions with automatic model discovery.

**Version:** 1.0.0

**Status:** Planning

---

## 1. Problem Statement

### 1.1 Current Situation

OpenCode currently has outdated Chutes models integrated directly into the application. These models:

- Are not dynamically synchronized with the latest available models
- May be missing newly released models
- Have potential naming conflicts with other model providers
- Require application updates to add new models

### 1.2 User Pain Points

1. **Stale Model List**: Users cannot access newly released Chutes models without updating OpenCode
2. **Naming Confusion**: Models from different providers may have overlapping names (e.g., "DeepSeek-R1" vs. "DeepSeek-R1" from another source)
3. **API Token Management**: No clear way to configure user-specific API tokens
4. **No Offline Caching**: Model metadata is fetched on every request, increasing latency

### 1.3 Proposed Solution

Develop a dedicated OpenCode plugin that:

- Dynamically syncs available models from `https://llm.chutes.ai/v1/models`
- Provides a conflict-free naming convention (prefix: `chutes/`)
- Supports user-provided `CHUTES_API_TOKEN` for authentication
- Implements intelligent caching for model metadata
- Offers both programmatic tools and slash commands for users

---

## 2. Product Goals

### 2.1 Primary Goals

1. **Dynamic Model Discovery**: Automatically fetch and cache the latest available Chutes models
2. **Seamless Integration**: Provide OpenCode-native experience for model selection and chat
3. **Conflict-Free Naming**: Ensure no naming conflicts with existing or future models
4. **Reliable Authentication**: Support user-provided API tokens with clear error handling
5. **Performance Optimization**: Implement caching to minimize API calls and latency

### 2.2 Secondary Goals

- **Comprehensive Error Handling**: Provide helpful error messages for common failure scenarios
- **Extensibility**: Design plugin architecture to easily support future enhancements
- **Developer Experience**: Create clean, well-documented codebase for future maintenance
- **Testing Coverage**: Achieve high test coverage for reliability

---

## 3. Target Audience

### 3.1 Primary Users

- **OpenCode Users**: Developers and AI enthusiasts using OpenCode for coding assistance
- **Chutes API Users**: Users who already have Chutes API tokens and want to use them in OpenCode

### 3.2 User Personas

1. **The Developer**: Uses OpenCode daily for coding tasks, wants access to the latest models
2. **The AI Enthusiast**: Experiments with different models, appreciates model variety
3. **The Enterprise User**: Needs reliable access to specific models for production use

---

## 4. Functional Requirements

### 4.1 Model Synchronization

#### FR-MOD-001: Fetch Available Models

**Priority:** Must Have

**Description:** The plugin shall fetch the current list of available models from the Chutes API.

**Acceptance Criteria:**

- Plugin can fetch models from `https://llm.chutes.ai/v1/models`
- API authentication uses user-provided `CHUTES_API_TOKEN`
- Response is parsed and validated against expected schema
- Fetch errors are handled gracefully with user-friendly messages

#### FR-MOD-002: Automatic Model Refresh

**Priority:** Should Have

**Description:** The plugin shall support automatic model list refresh at configurable intervals.

**Acceptance Criteria:**

- User can enable/disable auto-refresh (default: enabled)
- Refresh interval is configurable (default: 3600 seconds / 1 hour)
- Plugin respects cached data if API is unavailable
- Refresh can be triggered manually via tool/command

#### FR-MOD-003: Model Caching

**Priority:** Should Have

**Description:** The plugin shall cache model metadata to minimize API calls.

**Acceptance Criteria:**

- Cached model data is stored locally (in-memory or file-based)
- Cache expiration is configurable (default: 1 hour)
- Plugin validates cache freshness before use
- Cache can be cleared manually

### 4.2 Model Naming

#### FR-NAM-001: Conflict-Free Naming

**Priority:** Must Have

**Description:** All Chutes models shall use a prefix to avoid naming conflicts.

**Acceptance Criteria:**

- All model IDs are prefixed with `chutes/`
- Example: `Qwen/Qwen3-32B` → `chutes/Qwen/Qwen3-32B`
- Mapping between original and prefixed IDs is maintained internally
- User sees prefixed names in model selection

#### FR-NAM-002: Model Information Display

**Priority:** Should Have

**Description:** The plugin shall provide model information including pricing and capabilities.

**Acceptance Criteria:**

- Display model pricing (input/output costs per 1M tokens)
- Show supported features (json_mode, tools, reasoning, etc.)
- Display context window size (max_model_len)
- Indicate if model supports confidential compute

### 4.3 API Integration

#### FR-API-001: Chat Completions

**Priority:** Must Have

**Description:** The plugin shall provide chat completion functionality via the Chutes API.

**Acceptance Criteria:**

- Support POST to `https://llm.chutes.ai/v1/chat/completions`
- Accept OpenAI-compatible request format
- Return OpenAI-compatible response format
- Support streaming responses

#### FR-API-002: Authentication

**Priority:** Must Have

**Description:** The plugin shall authenticate requests using user-provided API token.

**Acceptance Criteria:**

- Token is configured via OpenCode configuration
- Token is sent as `Authorization: Bearer <token>` header
- Invalid token returns clear error message
- Missing token prompts user for configuration

#### FR-API-003: Error Handling

**Priority:** Must Have

**Description:** The plugin shall handle API errors gracefully with helpful messages.

**Acceptance Criteria:**

- Network errors: Retry up to 3 times with exponential backoff
- Authentication errors (401/403): Clear message to configure token
- Rate limiting (429): Respect headers, implement backoff
- Model not found: Suggest available models
- Server errors (500+): Retry or fail gracefully

### 4.4 OpenCode Integration

#### FR-OOC-001: Plugin Tools

**Priority:** Must Have

**Description:** The plugin shall register tools callable by the LLM during conversations.

**Acceptance Criteria:**

- Register `chutes_chat` tool for chat completions
- Register `chutes_list_models` tool to list available models
- Register `chutes_refresh_models` tool to refresh model list
- All tools have proper descriptions and argument schemas

#### FR-OOC-002: Config Hook

**Priority:** Must Have

**Description:** The plugin shall use OpenCode's config hook to inject models.

**Acceptance Criteria:**

- Inject Chutes models into OpenCode's model list
- Apply user configuration (default model, etc.)
- Handle configuration validation
- Support dynamic model updates

#### FR-OOC-003: Slash Commands

**Priority:** Could Have

**Description:** The plugin shall provide slash commands for user interaction.

**Acceptance Criteria:**

- `/chutes-chat`: Start a chat with Chutes models
- `/chutes-models`: List available Chutes models
- `/chutes-refresh`: Refresh the model list
- Commands have helpful descriptions

### 4.5 Configuration

#### FR-CFG-001: Plugin Configuration

**Priority:** Should Have

**Description:** The plugin shall support configuration options.

**Acceptance Criteria:**

- `apiToken`: User's Chutes API token (required)
- `autoRefresh`: Enable auto-refresh (default: true)
- `refreshInterval`: Cache TTL in seconds (default: 3600)
- `defaultModel`: Default model for chat
- `modelFilter`: Optional model whitelist (supports wildcards)

#### FR-CFG-002: Configuration Validation

**Priority:** Should Have

**Description:** The plugin shall validate configuration on startup.

**Acceptance Criteria:**

- Validate required fields (apiToken)
- Validate apiToken format (basic validation)
- Provide clear error messages for invalid config
- Use defaults for missing optional fields

---

## 5. Non-Functional Requirements

### 5.1 Performance

#### NFR-PER-001: Response Time

**Description:** Model list fetch should complete within 2 seconds.

**Acceptance Criteria:**

- First fetch: < 2 seconds (with valid token)
- Cached fetch: < 100ms
- Chat completion latency: Comparable to direct API call

#### NFR-PER-002: Caching Efficiency

**Description:** Implement efficient caching to minimize API calls.

**Acceptance Criteria:**

- Cache hit rate > 90% under normal usage
- Cache invalidation within 5 minutes of manual refresh

### 5.2 Reliability

#### NFR-REL-001: Uptime

**Description:** Plugin should handle API unavailability gracefully.

**Acceptance Criteria:**

- Use cached data if API is unavailable
- Clear error messages for prolonged outages
- Automatic retry on transient failures

#### NFR-REL-002: Error Recovery

**Description:** Plugin should recover from errors without manual intervention.

**Acceptance Criteria:**

- Automatic retry for network errors (max 3 attempts)
- Graceful degradation when cache is stale
- No plugin crashes from API responses

### 5.3 Security

#### NFR-SEC-001: Token Security

**Description:** API token should be handled securely.

**Acceptance Criteria:**

- Token stored in OpenCode config (user's responsibility)
- Token never logged or exposed in error messages
- Token sent only to Chutes API endpoints

#### NFR-SEC-002: Input Validation

**Description:** All inputs should be validated to prevent injection attacks.

**Acceptance Criteria:**

- Sanitize user inputs before API calls
- Validate all API response data
- No sensitive data in error traces

### 5.4 Usability

#### NFR-USA-001: Onboarding

**Description:** New users should be able to configure and use the plugin easily.

**Acceptance Criteria:**

- Clear setup instructions in README
- Helpful error messages with action items
- Sample configuration provided

#### NFR-USA-002: User Feedback

**Description:** Users should receive feedback on operations.

**Acceptance Criteria:**

- Model list refresh status indicator
- Chat response streaming
- Error notifications with suggestions

### 5.5 Maintainability

#### NFR-MNT-001: Code Quality

**Description:** Code should be well-structured and documented.

**Acceptance Criteria:**

- TypeScript with strict mode
- ESLint + Prettier formatting
- JSDoc comments for public APIs
- Unit test coverage > 80%

#### NFR-MNT-002: Extensibility

**Description:** Plugin should be easily extensible for future features.

**Acceptance Criteria:**

- Modular architecture (models/, api/, commands/)
- Clear separation of concerns
- Configuration-driven behavior

---

## 6. Technical Design

### 6.1 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    OpenCode Core                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌────────────────────────────┐  │
│  │ Config Hook     │    │ Tool Registration          │  │
│  │                 │    │                            │  │
│  │ - Inject models │    │ - chutes_chat              │  │
│  │ - Apply config  │    │ - chutes_list_models       │  │
│  └────────┬────────┘    │ - chutes_refresh_models   │  │
│           │              └────────────┬─────────────┘  │
│           │                           │                │
│  ┌────────▼───────────────────────────▼────────────┐  │
│  │              Chutes Plugin                         │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ API Layer                                    │  │  │
│  │  │ - ChutesClient                              │  │  │
│  │  │ - ChatCompletionsHandler                    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Model Layer                                  │  │  │
│  │  │ - ModelFetcher (API sync)                   │  │  │
│  │  │ - ModelCache (caching)                      │  │  │
│  │  │ - ModelRegistry (naming)                    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Config Layer                                 │  │  │
│  │  │ - Configuration management                  │  │  │
│  │  │ - Validation                                │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│           │                           │                  │
│           ▼                           ▼                  │
│  ┌─────────────────┐         ┌─────────────────────┐    │
│  │ Chutes API      │         │ Local Cache         │    │
│  │ (llm.chutes.ai) │         │ (File/In-memory)    │    │
│  └─────────────────┘         └─────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 6.2 File Structure

```
src/
├── index.ts                    # Main plugin entry point
├── config/
│   ├── index.ts               # Configuration management
│   └── schema.ts              # Config validation schema
├── models/
│   ├── index.ts               # Model layer exports
│   ├── fetcher.ts             # Fetch models from API
│   ├── cache.ts               # Cache management
│   ├── registry.ts            # Model naming registry
│   └── types.ts               # TypeScript type definitions
├── api/
│   ├── index.ts               # API layer exports
│   ├── client.ts              # Base API client
│   ├── chat.ts                # Chat completions handler
│   └── errors.ts              # API error classes
├── tools/
│   ├── index.ts               # Tool definitions
│   ├── chat.ts                # chutes_chat tool
│   ├── list-models.ts         # chutes_list_models tool
│   └── refresh.ts             # chutes_refresh_models tool
└── commands/
    ├── chutes-chat.md         # /chutes-chat command
    └── chutes-models.md       # /chutes-models command
```

### 6.3 Data Models

#### Model Schema

```typescript
interface ChutesModel {
  id: string; // Original model ID
  root: string;
  pricing: {
    prompt: number; // USD per 1M tokens
    completion: number; // USD per 1M tokens
  };
  quantization: string; // e.g., "bf16", "fp8"
  max_model_len: number; // Context window
  input_modalities: string[]; // ["text"] or ["text", "image"]
  output_modalities: string[]; // ["text"]
  supported_features: string[]; // ["json_mode", "tools", "reasoning"]
  confidential_compute: boolean;
}

interface CachedModelData {
  models: ChutesModel[];
  fetchedAt: number; // Timestamp
  expiresAt: number; // Timestamp
}
```

#### Plugin Configuration

```typescript
interface ChutesPluginConfig {
  apiToken?: string;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultModel?: string;
  modelFilter?: string[];
}
```

### 6.4 API Integration

#### Endpoints

| Endpoint               | Method | Purpose                |
| ---------------------- | ------ | ---------------------- |
| `/v1/models`           | GET    | Fetch available models |
| `/v1/chat/completions` | POST   | Create chat completion |

#### Request Headers

```typescript
{
  'Authorization': 'Bearer <CHUTES_API_TOKEN>',
  'Content-Type': 'application/json'
}
```

#### Response Format

The plugin shall use OpenAI-compatible response formats for chat completions.

### 6.5 Naming Convention

#### Model ID Mapping

| Original ID                      | OpenCode Model ID                       |
| -------------------------------- | --------------------------------------- |
| `Qwen/Qwen3-32B`                 | `chutes/Qwen/Qwen3-32B`                 |
| `deepseek-ai/DeepSeek-R1`        | `chutes/deepseek-ai/DeepSeek-R1`        |
| `chutesai/Mistral-Small-3.1-24B` | `chutes/chutesai/Mistral-Small-3.1-24B` |

#### Rationale

- `chutes/` prefix clearly identifies the model provider
- Preserves original model name for easy recognition
- Prevents conflicts with models from other providers
- Consistent with OpenCode's namespacing approach

---

## 7. Implementation Plan

### Phase 1: Core Infrastructure (Days 1-2)

1. **Setup & Dependencies**
   - Add necessary dependencies (if any beyond template)
   - Create TypeScript type definitions
   - Set up configuration schema

2. **Model Synchronization**
   - Implement `ModelFetcher` to fetch from API
   - Implement `ModelCache` for caching
   - Implement `ModelRegistry` for naming

3. **API Client**
   - Implement `ChutesClient` base class
   - Implement `ChatCompletionsHandler`
   - Add error handling and retry logic

### Phase 2: OpenCode Integration (Days 3-4)

1. **Tool Registration**
   - Create `chutes_chat` tool
   - Create `chutes_list_models` tool
   - Create `chutes_refresh_models` tool

2. **Config Hook**
   - Inject models into OpenCode's model list
   - Apply user configuration
   - Handle dynamic model updates

3. **Command Templates**
   - Create `/chutes-chat` command
   - Create `/chutes-models` command

### Phase 3: Testing & Polish (Days 5-6)

1. **Unit Tests**
   - Model fetching with mocked responses
   - Cache operations
   - API client methods
   - Error scenarios

2. **Integration Tests**
   - Mock server for API testing
   - Token validation
   - End-to-end chat flow

3. **Documentation**
   - Update README.md
   - Add API documentation
   - Configuration examples

---

## 8. Testing Strategy

### 8.1 Test Types

#### Unit Tests

- Model fetching (mock API response)
- Cache read/write operations
- Model registry naming logic
- Configuration validation

#### Integration Tests

- Mock API server with real response format
- Token authentication flow
- Chat completions with streaming
- Error handling scenarios

#### Manual Testing

- Plugin installation in OpenCode
- Model list display
- Chat completion flow
- Configuration validation

### 8.2 Test Coverage Goals

| Component    | Target Coverage |
| ------------ | --------------- |
| Models layer | 100%            |
| API layer    | 90%+            |
| Tools        | 85%+            |
| Config       | 100%            |
| **Overall**  | **90%+**        |

---

## 9. Security Considerations

### 9.1 Token Handling

- Token is stored in user's OpenCode config (user's responsibility)
- Token is never logged or exposed in error messages
- Token is sent only to Chutes API endpoints

### 9.2 Input Validation

- All user inputs are validated before API calls
- API responses are sanitized before processing
- No direct embedding of user data in API requests

### 9.3 Error Messages

- Error messages never expose sensitive information
- Authentication errors provide helpful setup instructions
- Rate limiting errors include retry guidance

---

## 10. Success Metrics

### 10.1 Quantitative Metrics

- **Model Sync Success Rate**: > 99%
- **Cache Hit Rate**: > 90%
- **Average Model List Load Time**: < 2 seconds
- **Test Coverage**: > 90%

### 10.2 Qualitative Metrics

- User satisfaction with model variety
- Clarity of error messages
- Ease of configuration
- Reliability of model synchronization

---

## 11. Open Questions

### 11.1 Technical Questions

1. Should model metadata be cached to file for persistence across restarts?
2. Should streaming responses be fully supported or simplified?
3. Should we implement request queuing for rate limiting?

### 11.2 UX Questions

1. Should we show a model picker UI in OpenCode?
2. Should we implement model comparison features?
3. Should we add cost estimation for chat sessions?

---

## 12. Appendix

### A. Available Models (as of document creation)

The Chutes API provides 48+ models including:

- Reasoning: DeepSeek-R1 series, Qwen3-Thinking
- Code: Qwen-Coder, Devstral, GPT-OSS
- Vision: Qwen-VL, Gemma-3-VL, InternVL3
- General: DeepSeek-V3, Qwen3, Hermes-4, Mistral-Small
- Specialized: GLM-4.5/4.6/4.7, Kimi-K2, NVIDIA-Nemotron

### B. Pricing Reference

Models range from $0.01-$1.90 per 1M tokens (input) and $0.01-$1.75 per 1M tokens (output).

### C. API Rate Limits

Consult Chutes API documentation for current rate limits.

---

**Document Version:** 1.0

**Created:** December 31, 2025

**Last Updated:** December 31, 2025

**Author:** Chutes Plugin Development Team

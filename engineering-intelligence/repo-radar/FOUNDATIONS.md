# Foundation Repository Radar

Snapshot: 2026-10-07. These are *candidates for the foundation layer*, not blanket endorsements.

| Repository | Primitive | Signal | Initial disposition |
|---|---|---|---|
| `openai/openai-agents-python` | Lightweight agent workflows/harness | MIT, ~29.9k stars, pushed 2026-10-07 | FOUNDATION candidate for compact agent services |
| `microsoft/agent-framework` | Agent + multi-agent orchestration, Python/.NET | MIT, ~14k stars, pushed 2026-10-06 | FOUNDATION candidate; compare with OpenAI/LangGraph |
| `langchain-ai/langgraph` | Durable/stateful agent graphs | MIT, ~42.8k stars, pushed 2026-10-07 | FOUNDATION candidate for explicit workflows |
| `browser-use/browser-use` | Browser-operating agents | MIT, ~117k stars, pushed 2026-10-07 | FOUNDATION/COMPONENT for web execution |
| `OpenHands/OpenHands` | Autonomous software engineering | MIT, ~90k stars, pushed 2026-10-07 | COMPONENT/reference for coding workers |
| `mem0ai/mem0` | Persistent agent memory | Apache-2.0, ~66.7k stars, active | COMPONENT; benchmark against graph memory |
| `getzep/graphiti` | Real-time knowledge graphs for agents | Apache-2.0, ~31.5k stars, pushed 2026-10-06 | COMPONENT for temporal/relational memory |
| `n8n-io/n8n` | Workflow/integration fabric | ~206k stars, pushed 2026-10-07 | COMPONENT; licence must be reviewed for intended use |
| `ComposioHQ/composio` | Tool/auth/context layer for agents | MIT, ~30.5k stars, pushed 2026-10-07 | COMPONENT for external-tool execution |
| `temporalio/sdk-python` | Durable execution | MIT, active | FOUNDATION candidate for long-running reliable workflows |
| `WolframResearch/AgentTools` | Wolfram MCP bridge | MIT, pushed 2026-10-07 | HIGH-PRIORITY COMPONENT for quantitative decision layer |
| `WolframResearch/WolframClientForPython` | Python ↔ Wolfram bridge | MIT | COMPONENT |
| `anyoptimization/pymoo` | Multi-objective/Pareto optimisation | Apache-2.0 | COMPONENT delegated optimisation |
| `optuna/optuna` | Search/optimisation | MIT, active | COMPONENT for empirical parameter search |
| `Pyomo/pyomo` | Mathematical optimisation models | active | COMPONENT; verify licence requirements per distribution |

## Composition hypothesis

Do **not** choose one giant "agent framework". A likely stronger architecture is:

- small agent harness for reasoning/tool calls;
- explicit durable workflow runtime;
- dedicated browser and coding workers;
- memory/knowledge graph as replaceable service;
- integration/auth fabric;
- event/evidence ledger;
- Wolfram quantitative decision service;
- project-specific deterministic modules.

The competitive advantage should live in the **economic decision loop, capability compiler, evidence graph, experiment system and learned policy**, not in whichever orchestration library is fashionable this month.

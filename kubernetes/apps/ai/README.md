# AI Namespace

This directory manages the applications and configurations for the `ai` namespace.

> **Cluster placement:** All AI workloads run on **Talos II** only. The Talos I `ks.yaml` suspends `openviking`, `memoh`, and all `zeroclaw-*` Kustomizations.

## Applications

### Infrastructure

- **tigerfs**: PostgreSQL instance retained for future workspace/versioning needs. Runs on both clusters.
- **tabby**: Self-hosted AI coding assistant frontend/server. Runs on Talos II with PVC-backed `/data`, an app-local Secret for `config.toml` + JWT secret, and a Tailscale-exposed HTTP service.

### Memory

- **openviking**: Long-term context database using the `viking://` URI scheme with L0/L1/L2 layered content. Exposes an HTTP API on port 1933 and an MCP endpoint. Storage backed by Harvester CSI PVC. VLM and embedding served by the local `omlx-llm` service (Qwen3-VL-8B + Qwen3-Embedding-4B).

### Agents (Cyber Sephiroth Tree)

Five agents forming a distributed self-cognition system modeled on the Kabbalistic Tree of Life. Each observes a different layer of the user's (Beacon1096's) behavior and participates in a periodic roundtable coordinated by Kether.

| Agent | Sephira | Role | Model |
|-------|---------|------|-------|
| **zeroclaw-kether** | Kether 👑 | Coordinator (Polaris1087) — manages roundtable + diff analysis | Cloud LLM |
| zeroclaw-chokmah | Chokmah ✨ | Methodology — rational decision patterns | Cloud LLM |
| zeroclaw-binah | Binah 🔮 | Sensibility — aesthetics / intuition / emotional patterns | Cloud LLM |
| zeroclaw-yesod | Yesod 🔧 | Tech observer — technical choices | Local Qwen |
| zeroclaw-malkuth | Malkuth 🥤 | Life observer — daily habits / preferences | Local Qwen |

> Chokmah, Binah, Yesod, Malkuth are commented out in `kustomization.yaml` pending Kether canary validation.

### Planned

- **memoh**: Self-hosted always-on agent platform (replaces ZeroClaw bot runtime). Pending Talos K8s spike test for containerd-in-K8s feasibility.

## Notes

- All Matrix accounts/rooms pre-created on the Synapse homeserver at `matrix-synapse.collaboration.svc.cluster.local:8008`.
- Matrix access tokens are stored in `cluster-secrets` as `ZEROCLAW_*_MATRIX_ACCESS_TOKEN` (with device_id binding).
- System prompts must be written in Chinese.
- The "middle layer" (Tiferet) is not a deployed agent — it emerges from cross-layer diff during roundtable.

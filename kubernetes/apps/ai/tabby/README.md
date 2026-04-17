# Tabby

Self-hosted Tabby server running in the `ai` namespace on **Talos II**.

- **Namespace:** ai
- **Clusters:** Talos II only
- **Image:** `registry.tabbyml.com/tabbyml/tabby:0.31.2`
- **Storage:** Harvester CSI PVC mounted at `/data`
- **Exposure:** internal ClusterIP service plus Tailscale service `tabby`
- **Upstream model provider:** OpenAI-compatible HTTP API

## Notes

- Runtime state is persisted in `/data`.
- `config.toml` and the JWT secret are stored in an app-local Secret.
- This app replaces the legacy `service-tabby` Harvester VM.

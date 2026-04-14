# Talos Image Factory

Self-hosted Talos Image Factory for generating Talos assets with a custom extension catalog.

- **Namespace:** registry
- **Clusters:** Talos II only
- **Access:** cluster-local Service plus Tailscale hostname `talos-image-factory`
- **Chart:** image-factory v1.0.2
- **Catalog:** `ghcr.io/beacon1096/extensions:v1.12.6`
- **Artifacts:** GHCR-backed schematics, cache, and installer repositories under `beacon1096/image-factory`
- **Config:** Internal-only HTTP frontend; optional Tailscale access; container signature verification disabled pending signed custom catalog/extension images

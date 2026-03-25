# swarm-01

Homelab multi-cluster Kubernetes setup managed by Flux, running on Talos Linux with Harvester HCI as the hypervisor.

## Clusters

| Cluster | Nodes | Hardware | K8s Version | CSI | Notes |
|---------|-------|----------|-------------|-----|-------|
| **Talos I** (NEC8) | virt-01/02/03 | NEC mini PCs | 1.35.2 | Harvester | Primary cluster, all services |
| **Talos II** (MS-01) | talos-ii-01/02/03 | MS-01 | 1.35.2 | Harvester | Secondary cluster, infra-only subset |

Both clusters share the same Git repo and app manifests (`kubernetes/apps/`). Talos II selectively suspends non-essential services via Flux Kustomization patches.

## Repository Structure

```
bootstrap/          Helmfile-based initial cluster setup
images/             Container image builds (eliza-runtime, mem0-api-server)
kubernetes/
  apps/             Application manifests (Flux discovers subdirs automatically)
  components/       Shared components (e.g. SOPS decryption)
  flux/
    talos-i/        Talos I (NEC8) cluster Flux config (ks.yaml)
    talos-ii/       Talos II (MS-01) cluster Flux config (ks.yaml with suspension patches)
scripts/            Bootstrap and image build scripts
talos-i/            Talos I (NEC8) node configurations
talos-ii/           Talos II (MS-01) cluster config (talconfig, harvester provisioning, patches)
```

## Service Inventory

> **Legend**: Talos I = primary cluster (NEC8), Talos II = secondary cluster (MS-01)
> Suspended services on Talos II are marked with `--`.

| Namespace | Service | Talos I | Talos II | Domain | Description |
|-----------|---------|:----:|:--------:|--------|-------------|
| **ai** | Eliza | yes | -- | -- | ElizaOS agent, Matrix bot |
| **ai** | Mem0 | yes | -- | -- | Memory API for agents |
| **cert-manager** | cert-manager | yes | yes | -- | TLS certificate management |
| **collaboration** | Matrix (Synapse) | yes | -- | matrix.* | Matrix homeserver |
| **default** | echo | yes | -- | echo.* | Test/health-check endpoint |
| **development** | Atuin | yes | yes | -- | Shell history sync |
| **development** | Coder | yes | yes | code.* | Cloud dev environments, OIDC via Authentik |
| **development** | Forgejo | -- | yes | forgejo.* | Git forge, mirroring, OIDC via Authentik |
| **development** | Forgejo Runner | yes | -- | -- | CI runner for Forgejo (connects via public URL) |
| **flux-system** | flux-instance | yes | yes | -- | Flux GitOps instance |
| **flux-system** | flux-operator | yes | yes | -- | Flux operator |
| **identity** | Authentik | yes | yes | id.* | OIDC/SSO provider |
| **identity** | Vaultwarden | yes | yes | vault.* | Password manager |
| **kube-system** | Cilium | yes | yes | -- | CNI |
| **kube-system** | CoreDNS | yes | -- | -- | Cluster DNS |
| **kube-system** | Harvester CSI | yes | yes | -- | Persistent storage (separate config per cluster) |
| **kube-system** | metrics-server | yes | yes | -- | Resource metrics |
| **kube-system** | Reloader | yes | yes | -- | ConfigMap/Secret change watcher |
| **kube-system** | Spegel | yes | yes | -- | In-cluster image registry mirror |
| **network** | Cloudflare DNS | yes | yes | -- | External DNS via Cloudflare |
| **network** | Cloudflare Tunnel | yes | yes | -- | Ingress via Cloudflare Tunnel |
| **network** | Envoy Gateway | yes | yes | -- | Ingress gateway |
| **network** | k8s-gateway | yes | yes | -- | Internal DNS for services |
| **network** | sing-box | yes | yes | -- | Proxy |
| **network** | Tailscale | yes | yes | -- | VPN mesh |
| **nix** | Attic | yes | yes | nix.* | Nix binary cache |
| **observability** | Uptime Kuma | yes | -- | -- | Uptime monitoring |
| **observability** | Victoria Logs | yes | -- | -- | Log aggregation |
| **observability** | Victoria Logs Collector | yes | -- | -- | Log collector |
| **observability** | Victoria Metrics | yes | -- | -- | Metrics storage |
| **home** | Home Assistant | -- | yes | Tailscale | Home automation |
| **media** | Immich | -- | yes | Tailscale | Photo/video management |
| **media** | Navidrome | -- | yes | Tailscale | Music streaming (Subsonic API) |
| **registry** | Zot | -- | yes | registry.* / Tailscale | OCI registry, pull-through cache |

## Key Technologies

- **OS**: [Talos Linux](https://talos.dev)
- **GitOps**: [Flux v2](https://fluxcd.io) (via flux-operator)
- **CNI**: [Cilium](https://cilium.io)
- **Ingress**: [Envoy Gateway](https://gateway.envoyproxy.io) + [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/)
- **Secrets**: [SOPS](https://github.com/getsops/sops) + age encryption
- **Storage**: Harvester CSI (backed by Harvester HCI Longhorn)

# swarm-01

Homelab multi-cluster Kubernetes setup managed by Flux, running on Talos Linux with Harvester HCI as the hypervisor.

## Clusters

| Cluster | Nodes | Hardware | K8s Version | CSI | Current role |
|---------|-------|----------|-------------|-----|--------------|
| **Talos I** (NEC8) | virt-01/02/03 | NEC mini PCs | 1.35.3 | Harvester | Observability + CI Runner cluster |
| **Talos II** (MS-01) | talos-ii-01/02/03 | MS-01 | 1.35.3 | Harvester | Production workloads + AI + collaboration + CI/CD |

Both clusters share the same Git repo and app manifests (`kubernetes/apps/`). Runtime placement is controlled by Flux suspension patches in:

- `kubernetes/flux/talos-i/ks.yaml`
- `kubernetes/flux/talos-ii/ks.yaml`

## Repository Structure

```
bootstrap/          Helmfile-based initial cluster setup
images/             Container image builds (eliza-runtime, mem0-api-server)
kubernetes/
  apps/             Application manifests (Flux discovers subdirs automatically)
  components/       Shared components (e.g. SOPS decryption)
  flux/
    talos-i/        Talos I cluster Flux config (suspends Talos II-only workloads)
    talos-ii/       Talos II cluster Flux config (suspends Talos I-only workloads)
scripts/            Bootstrap and image build scripts
talos-i/            Talos I node configurations
talos-ii/           Talos II cluster config (talconfig, harvester provisioning, patches)
```

## Service Inventory (from current Flux placement)

| Cluster | Active services |
|---------|------------------|
| **Talos I** | observability stack (`victoria-metrics`, `victoria-logs`, `victoria-logs-collector`, `uptime-kuma`), `forgejo-runner`, plus shared infra components |
| **Talos II** | AI (`eliza`, `mem0`), collaboration (`matrix`), identity (`authentik`, `vaultwarden`), development (`atuin`, `coder`, `forgejo`, `n8n`), home/media (`home-assistant`, `immich`, `navidrome`), registry (`zot`), nix (`attic`), network apps, plus shared infra components |

> Do not hardcode real domains in docs/manifests. Use placeholders such as `service.${SECRET_DOMAIN}`.

Forgejo's public web URL stays at `https://forgejo.${SECRET_DOMAIN}` on Talos II, while the Talos I `forgejo-runner` uses the internal `forgejo-ts.development.svc.cluster.local:3000` Tailscale egress service for cluster-to-cluster access.

## Key Technologies

- **OS**: [Talos Linux](https://talos.dev)
- **GitOps**: [Flux v2](https://fluxcd.io) (via flux-operator)
- **CNI**: [Cilium](https://cilium.io)
- **Ingress**: [Envoy Gateway](https://gateway.envoyproxy.io) + [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/)
- **Secrets**: [SOPS](https://github.com/getsops/sops) + age encryption
- **Storage**: Harvester CSI (backed by Harvester HCI Longhorn), with guest `StorageClass/harvester` managed in GitOps and bound via `WaitForFirstConsumer`

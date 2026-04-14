# kubernetes/

FluxCD-managed Kubernetes application manifests, shared by both Talos I and Talos II clusters.

## Structure

```
apps/                 Application manifests, organized by namespace
  <namespace>/
    <app>/
      ks.yaml         Flux Kustomization (entry point)
      app/            HelmRelease, configs, secrets, HTTPRoutes
components/           Shared Kustomize components (e.g. SOPS provider)
flux/
  talos-i/ks.yaml     Talos I parent Kustomization (observability + CI-runner + shared infra)
  talos-ii/ks.yaml    Talos II parent Kustomization (production/AI/collab + shared infra)
```

## How it works

- There is **no top-level `apps/kustomization.yaml`** — Flux discovers namespace subdirs automatically.
- Each app's `ks.yaml` is a Flux Kustomization pointing to its `app/` subdir.
- The parent Kustomization (`flux/talos-i/ks.yaml` or `flux/talos-ii/ks.yaml`) injects shared defaults:
  - SOPS decryption
  - HelmRelease install/upgrade strategies
  - `postBuild.substituteFrom: cluster-secrets` for variable substitution
- Cluster placement is decided by per-cluster `spec.suspend` patches. Always treat `flux/talos-i/ks.yaml` and `flux/talos-ii/ks.yaml` as the source of truth.

## Placement summary (current intent)

- **Talos I:** observability namespace apps + `development/forgejo-runner` + shared infrastructure apps.
- **Talos II:** AI, collaboration, identity, most development apps, home/media, registry, nix, network apps + shared infrastructure apps.
- `development/forgejo` remains Talos II-only, while `development/forgejo-runner` remains Talos I-only and reaches Forgejo through the internal `forgejo-ts.development.svc.cluster.local:3000` Tailscale egress path instead of the public `forgejo.${SECRET_DOMAIN}` entrypoint.

## Apps by Namespace

### ai
| App | Description |
|-----|-------------|
| eliza | ElizaOS agent with Matrix bot, PostgreSQL state, OpenAI-compat LLM |
| mem0 | Memory API for agents |

### cert-manager
| App | Description |
|-----|-------------|
| cert-manager | TLS certificate lifecycle management |

### collaboration
| App | Description |
|-----|-------------|
| matrix | Matrix Synapse homeserver |

### default
| App | Description |
|-----|-------------|
| echo | Test/health-check echo service |

### development
| App | Description |
|-----|-------------|
| atuin | Shell history sync server |
| coder | Cloud development environments (OIDC via Authentik) |
| forgejo | Git forge with mirroring (OIDC via Authentik) |
| forgejo-runner | CI runner for Forgejo |
| n8n | Workflow automation service |

### flux-system
| App | Description |
|-----|-------------|
| flux-instance | Flux GitOps instance |
| flux-operator | Flux operator |

### identity
| App | Description |
|-----|-------------|
| authentik | OIDC/SSO identity provider |
| vaultwarden | Bitwarden-compatible password manager |

### kube-system
| App | Description |
|-----|-------------|
| cilium | CNI networking |
| coredns | Cluster DNS |
| harvester-csi-driver | Persistent storage via Harvester HCI; guest `StorageClass/harvester` is GitOps-managed with `WaitForFirstConsumer` |
| metrics-server | Resource metrics API |
| reloader | Watches ConfigMap/Secret changes and triggers rollouts |
| spegel | In-cluster P2P image registry mirror |

### network
| App | Description |
|-----|-------------|
| cloudflare-dns | External DNS records via Cloudflare API |
| cloudflare-tunnel | Ingress tunnel to Cloudflare edge |
| envoy-gateway | Gateway API implementation (Envoy-based) |
| k8s-gateway | Internal DNS resolution for K8s services |
| sing-box | Network proxy |
| tailscale | VPN mesh networking |

### home
| App | Description |
|-----|-------------|
| home-assistant | Home automation platform |

### media
| App | Description |
|-----|-------------|
| immich | Self-hosted photo/video management (pgvecto.rs + Redis + ML) |
| navidrome | Music streaming server with Subsonic API |

### nix
| App | Description |
|-----|-------------|
| attic | Multi-tenant Nix binary cache (PostgreSQL backend) |

### observability
| App | Description |
|-----|-------------|
| uptime-kuma | Uptime monitoring dashboard |
| victoria-logs | Log aggregation (VictoriaLogs) |
| victoria-logs-collector | Log collection agent |
| victoria-metrics | Metrics storage and querying |

### registry
| App | Description |
|-----|-------------|
| talos-image-factory | Self-hosted Talos Image Factory with custom extension catalog support |
| zot | OCI registry with pull-through cache (docker.io, ghcr.io, k8s.io, quay.io, elastic.co, code.forgejo.org) |

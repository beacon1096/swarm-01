# talos-i/

Talos I cluster (NEC8) node configurations. Current role is **observability + CI/CD runner**, with shared cluster infrastructure.

## Nodes

| Node | Role |
|------|------|
| virt-01 | Control plane + worker |
| virt-02 | Control plane + worker |
| virt-03 | Control plane + worker |

## Structure

```
talconfig.yaml          Talhelper cluster configuration template
talenv.yaml             Talos/K8s version and schematic ID
talsecret.sops.yaml     Encrypted Talos cluster secrets
clusterconfig/          Generated per-node configs, kubeconfig, talosconfig
patches/                Node patches (if any)
```

## Flux Config

The Flux parent Kustomization for this cluster is at `kubernetes/flux/talos-i/ks.yaml`.

This cluster intentionally **suspends Talos II-owned workloads** (such as AI/collaboration/identity/media/home/registry apps) and keeps:

- observability apps
- `development/forgejo-runner`
- shared infra components

## Image Mirrors

Talos I nodes use containerd registry mirrors from `patches/global/machine-registries.yaml`.
For `code.forgejo.org`, Talos I pulls first through Zot over the Tailnet at `http://zot.tail5d550.ts.net:5000/v2/code.forgejo.org`, then falls back to the upstream registry.

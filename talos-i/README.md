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

## CSI and upgrade caveats

Talos I uses the same Harvester CSI driver family as Talos II and has already shown the same `NodeUnstageVolume` / `nsenter ... mountpoint ... No such file or directory` failure mode in live logs. Because of that, Talos I should follow the same custom installer chain used on Talos II instead of the old `installer-secureboot` path.

### Configured installer path

- `talosVersion`: `v1.12.6`
- `talosImageURL`: `ghcr.io/beacon1096/image-factory/installer/installer/59ec945d479edcdcc22eaeac0460d4f3b6f12822ff910640212c5189a8b0463f`
- `machineSpec.secureboot`: `false`

### Before an actual Talos I upgrade

The Harvester/KubeVirt VM settings should also be aligned with the Talos II validated path before rebooting upgraded nodes:

- Secure Boot disabled
- EFI persistence disabled
- TPM disabled
- TPM persistence state disabled

These VM-level settings are not expressed directly in `talconfig.yaml`, so they must be applied in Harvester before rolling node upgrades.

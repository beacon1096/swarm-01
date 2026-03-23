# talos-i/

Talos I cluster (NEC8) node configurations — the primary 3-node control-plane cluster running on NEC mini PCs with Harvester HCI.

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

The Flux parent Kustomization for this cluster is at `kubernetes/flux/talos-i/ks.yaml`. All services in `kubernetes/apps/` are active (no suspensions).

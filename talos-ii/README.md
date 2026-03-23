# talos-ii/

Talos II cluster configuration — a secondary 3-node control-plane cluster running on MS-01 hardware, provisioned as VMs on Harvester HCI.

## Nodes

| Node | Role |
|------|------|
| talos-ii-01 | Control plane + worker |
| talos-ii-02 | Control plane + worker |
| talos-ii-03 | Control plane + worker |

## Structure

```
talconfig.yaml              Talhelper cluster configuration template
talenv.yaml                 Talos/K8s version and schematic ID
talsecret.sops.yaml         Encrypted Talos cluster secrets
clusterconfig/              Generated per-node configs, kubeconfig, talosconfig
harvester/                  Harvester HCI provisioning manifests
  00-namespace.yaml         Namespace for Talos II VMs
  01-vpc.yaml               Virtual network (VPC)
  02-subnet.yaml            Subnet definition
  03-nad.yaml               Network Attachment Definition
  04-image.yaml             Talos OS image for VM boot
  05-vms.yaml               VM definitions (3 control-plane nodes)
  06-bootstrap-job.yaml     Bootstrap job to initialize the cluster
patches/
  controller/               Controller-node-specific patches
  global/                   Global patches applied to all nodes
    machine-files.yaml      Extra machine files
    machine-registries.yaml Container registry mirrors (via Zot on Talos I)
    machine-sysctls.yaml    Kernel parameters
    machine-kubelet.yaml    Kubelet configuration
    machine-network.yaml    Network configuration
    machine-time.yaml       NTP configuration
```

## Relationship to Talos I

Talos II shares the same application manifests (`kubernetes/apps/`) as the Talos I cluster. The Flux parent Kustomization at `kubernetes/flux/talos-ii/ks.yaml` controls what runs on this cluster:

**Active services** (24): cert-manager, atuin, coder, forgejo, flux-instance, flux-operator, authentik, vaultwarden, cilium, harvester-csi-driver, metrics-server, reloader, spegel, cloudflare-dns, cloudflare-tunnel, envoy-gateway, k8s-gateway, sing-box, tailscale, attic, zot, home-assistant, immich, navidrome

**Suspended services** (12): eliza, mem0, coredns, echo, forgejo-runner, matrix, mattermost, uptime-kuma, victoria-logs, victoria-logs-collector, victoria-metrics

## Cluster-specific overrides (via Flux patches)

- Pod CIDR: `10.44.0.0/16`
- Envoy external IP: `10.20.0.200`
- Envoy internal IP: `10.20.0.201`
- k8s-gateway IP: `10.20.0.202`
- Zot registry LB IP: `10.20.0.203`
- Spegel mirrors to local Zot (`http://10.20.0.203:5000`)
- Container images routed through `registry.beaco.works` (local Zot)
- Harvester CSI uses Talos II-specific config (`kubernetes/apps/kube-system/harvester-csi-driver/talos-ii/`)
- Envoy Gateway skips CRD install (Gateway API pre-installed)
- Bitnami PostgreSQL images overridden to avoid digest-pinned pull issues

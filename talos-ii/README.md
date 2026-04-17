# talos-ii/

Talos II cluster configuration for the main production workload cluster on MS-01 hardware, provisioned as VMs on Harvester HCI.

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
    machine-registries.yaml Container registry mirrors (via Zot)
    machine-sysctls.yaml    Kernel parameters
    machine-kubelet.yaml    Kubelet configuration
    machine-network.yaml    Network configuration
    machine-time.yaml       NTP configuration
```

## Relationship to Talos I

Talos II shares the same application manifests (`kubernetes/apps/`) as Talos I. The Flux parent Kustomization at `kubernetes/flux/talos-ii/ks.yaml` controls placement for this cluster.

Current role:

- production workloads
- AI services
- collaboration/identity services
- most development apps
- network ingress/egress components

## Cluster-specific overrides (via Flux patches)

- Pod CIDR: `10.44.0.0/16`
- Envoy external IP: `10.20.0.200`
- Envoy internal IP: `10.20.0.201`
- k8s-gateway IP: `10.20.0.202`
- Zot registry LB IP: `10.20.0.203`
- Spegel mirrors to local Zot (`http://10.20.0.203:5000`)
- Container images routed through `registry.beaco.works`
- Harvester CSI uses Talos II-specific config (`kubernetes/apps/kube-system/harvester-csi-driver/talos-ii/`)
- Envoy Gateway skips CRD install (Gateway API pre-installed)
- Bitnami PostgreSQL images overridden to avoid digest-pinned pull issues

## Validated Talos v1.12.6 upgrade path

Talos II was successfully upgraded node-by-node to `Talos v1.12.6` using a self-hosted Image Factory and a custom `util-linux-mountpoint` system extension. The custom extension exists to provide `mountpoint` in the Talos host environment, which avoids Harvester CSI `NodeUnstageVolume` failures of the form `nsenter ... mountpoint ... No such file or directory`.

### Working image chain

- Custom extension image: `ghcr.io/beacon1096/util-linux-mountpoint:2.41.4-talos1.12.6`
- Custom extension catalog: `ghcr.io/beacon1096/extensions:v1.12.6`
- Self-hosted factory schematic used for the upgrade: `59ec945d479edcdcc22eaeac0460d4f3b6f12822ff910640212c5189a8b0463f`
- Installer image used by `talosctl upgrade --image`:
  `ghcr.io/beacon1096/image-factory/installer/installer/59ec945d479edcdcc22eaeac0460d4f3b6f12822ff910640212c5189a8b0463f:v1.12.6`

### Required Harvester/KubeVirt VM settings

For all Talos II VMs, the upgrade only recovered cleanly after applying the following VM firmware/device settings before rebooting the upgraded node:

- `secureBoot: false`
- `efi persistence: false`
- `tpm: disabled`
- `tpm persistence state: disabled`

Leaving the original Secure Boot / TPM persistence combination enabled caused upgraded VMs to remain running in Harvester while failing to return to a healthy Talos/kubelet/control-plane state.

### Operational notes

- Upgrade **one node at a time** and wait for full recovery before touching the next node.
- During recovery, Harvester/KubeVirt hotplug metadata may lag behind VM/VMI runtime state. When this happens, the safest fix pattern is:
  1. scale the affected StatefulSet to `0`
  2. delete only the matching stale `VolumeAttachment`
  3. scale back to `1`
- `talos-ii-02` remained the noisiest node during recovery and produced repeated historical `VolumeFailedDelete` tails for old PVs, even after the node itself was healthy again.

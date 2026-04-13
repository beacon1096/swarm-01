# Harvester CSI Driver

Persistent storage via Harvester HCI (Longhorn backend).

- **Namespace:** kube-system
- **Clusters:** Talos I, Talos II (separate config per cluster)
- **Chart:** harvester-csi-driver v0.1.25
- **Config:** kubeletRootDir=/var/lib/kubelet, per-cluster cloud-config secrets, GitOps post-render patch sets guest `StorageClass/harvester` to `volumeBindingMode: WaitForFirstConsumer`
- **Note:** Talos II uses `talos-ii/` subdir for its own Harvester endpoint config

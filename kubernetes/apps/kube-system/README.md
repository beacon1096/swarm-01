# Kube-System Namespace

This directory manages the core applications and configurations for the `kube-system` namespace within the Kubernetes cluster.

## Applications

- **cilium**: eBPF-based networking, observability, and security.
- **coredns**: Core DNS resolution service for the cluster.
- **harvester-csi-driver**: Container Storage Interface driver with guest `StorageClass/harvester` patched to `WaitForFirstConsumer`.
- **metrics-server**: Scalable resource metrics collector.
- **reloader**: A Kubernetes controller to watch changes in ConfigMap and Secrets and do rolling upgrades on Pods.
- **spegel**: Stateless cluster-local OCI registry mirror.

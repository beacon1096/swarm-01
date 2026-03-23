# k8s-gateway

Internal DNS resolution for Kubernetes services (split-horizon DNS).

- **Namespace:** network
- **Clusters:** Talos I, Talos II
- **Chart:** k8s-gateway (OCI)
- **Config:** LoadBalancer on port 53, watches HTTPRoute + Service resources

# Flux Instance

Flux GitOps instance syncing from GitHub.

- **Namespace:** flux-system
- **Clusters:** Talos I, Talos II
- **Domain:** `flux-webhook.${SECRET_DOMAIN}`
- **Chart:** flux-instance (OCI) v0.43.0
- **Config:** kustomize/helm/source/notification controllers, SOPS age decryption, sing-box proxy for GFW bypass

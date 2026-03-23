# Zot

OCI container registry with pull-through cache.

- **Namespace:** registry
- **Clusters:** Talos II only
- **Domain:** `registry.${SECRET_DOMAIN}` (Cloudflare), `zot` (Tailscale)
- **Chart:** zot v0.1.98
- **Storage:** 50Gi
- **Config:** Pull-through mirrors for docker.io, ghcr.io, registry.k8s.io, quay.io, elastic.co; htpasswd auth; UI enabled
- **Tailscale:** Exposed as `zot` on Tailnet, allowing Talos I to access the registry without going through Cloudflare

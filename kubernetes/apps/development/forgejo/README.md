# Forgejo

Lightweight Git forge with repository mirroring.

- **Namespace:** development
- **Clusters:** Talos II only
- **Domain:** `forgejo.${SECRET_DOMAIN}`
- **Chart:** forgejo-charts (OCI)
- **Config:** Rootless, mirror enabled (8h interval), actions enabled, OIDC via Authentik (temporarily disabled), SSH disabled
- **Access:** Exposed via Tailscale (`forgejo.tail5d550.ts.net:3000`), external VPS caddy proxies via Tailscale

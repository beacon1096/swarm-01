# Forgejo

Lightweight Git forge with repository mirroring.

- **Namespace:** development
- **Clusters:** Talos II only
- **Domain:** `forgejo.${SECRET_DOMAIN}`
- **Chart:** forgejo-charts (OCI)
- **Config:** Rootless, mirror enabled (8h interval), actions enabled, OIDC via Authentik (temporarily disabled), SSH enabled (port 22), public `ROOT_URL` stays on `https://forgejo.${SECRET_DOMAIN}`, runner-local `LOCAL_ROOT_URL` points to `http://forgejo-ts.development.svc.cluster.local:3000`
- **Access:** Exposed via Tailscale (`forgejo.tail5d550.ts.net:3000` for HTTP, `forgejo.tail5d550.ts.net:22` for SSH), external VPS caddy proxies via Tailscale, Talos I `forgejo-runner` reaches Forgejo through the `forgejo-ts.development.svc.cluster.local:3000` egress service so Actions control-plane and local worker traffic can stay off the public reverse proxy

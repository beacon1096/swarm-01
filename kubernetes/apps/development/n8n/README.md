# n8n

Workflow automation platform.

- **Namespace:** development
- **Clusters:** Talos II only
- **Domain:** `automaton.${SECRET_DOMAIN}`
- **Chart:** app-template v4.6.2
- **Dependencies:** n8n-postgresql (Bitnami PostgreSQL 16.x, 5Gi)
- **Storage:** 5Gi app data (`/home/node/.n8n`)
- **Config:** HTTPS via Envoy Gateway, PostgreSQL backend, task runners enabled
- **Planned SSO:** Authentik SAML via `https://id.${SECRET_DOMAIN}/application/saml/n8n/metadata/` (configure in n8n UI after deploy)

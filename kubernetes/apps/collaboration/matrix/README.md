# Matrix (Synapse)

Matrix homeserver with Element Web client.

- **Namespace:** collaboration
- **Clusters:** Talos I only
- **Domains:** `matrix.${SECRET_DOMAIN}`, `chat.${SECRET_DOMAIN}` (Element Web), `${SECRET_DOMAIN}/.well-known/matrix`
- **Chart:** matrix-synapse v3.12.22
- **Dependencies:** PostgreSQL (lc_collate=C) + Redis (auth enabled, 20Gi)
- **Config:** OIDC via Authentik, federation disabled, registration disabled

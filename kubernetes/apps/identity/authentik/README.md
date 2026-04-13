# Authentik

OIDC/SSO identity provider for all cluster services.

- **Namespace:** identity
- **Clusters:** Talos II only
- **Domain:** `id.${SECRET_DOMAIN}`
- **Chart:** authentik v2025.8.4
- **Dependencies:** PostgreSQL (Bitnami, 8Gi) + Redis standalone
- **Runtime note:** PostgreSQL and Redis are currently pinned to `talos-ii-01` to avoid RWO volume re-attach failures during chart upgrades
- **Config:** Email via mail.beacoworks.xyz, provides OIDC for Forgejo/Coder/Vaultwarden/Matrix

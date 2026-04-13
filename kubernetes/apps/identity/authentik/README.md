# Authentik

OIDC/SSO identity provider for all cluster services.

- **Namespace:** identity
- **Clusters:** Talos II only
- **Domain:** `id.${SECRET_DOMAIN}`
- **Chart:** authentik v2025.10.3
- **Dependencies:** PostgreSQL (Bitnami, 8Gi)
- **Runtime note:** PostgreSQL is currently pinned to `talos-ii-01` to avoid RWO volume re-attach failures during chart upgrades
- **Config:** Email via mail.beacoworks.xyz, provides OIDC for Forgejo/Coder/Vaultwarden/Matrix

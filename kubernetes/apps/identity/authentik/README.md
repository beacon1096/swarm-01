# Authentik

OIDC/SSO identity provider for all cluster services.

- **Namespace:** identity
- **Clusters:** Talos I, Talos II
- **Domain:** `id.${SECRET_DOMAIN}`
- **Chart:** authentik v2025.4.0
- **Dependencies:** PostgreSQL (Bitnami, 8Gi) + Redis standalone
- **Config:** Email via mail.beacoworks.xyz, provides OIDC for Forgejo/Coder/Vaultwarden/Matrix

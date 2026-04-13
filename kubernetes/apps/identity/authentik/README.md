# Authentik

OIDC/SSO identity provider for all cluster services.

- **Namespace:** identity
- **Clusters:** Talos II only
- **Domain:** `id.${SECRET_DOMAIN}`
- **Chart:** authentik v2025.8.6
- **Dependencies:** PostgreSQL (Bitnami, 8Gi) + Redis standalone
- **Config:** Email via mail.beacoworks.xyz, provides OIDC for Forgejo/Coder/Vaultwarden/Matrix

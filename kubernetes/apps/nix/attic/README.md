# Attic

Nix binary cache server with multi-tenant support and PostgreSQL backend.

- **Namespace:** nix
- **Clusters:** Talos I, Talos II
- **Domain:** `nix.${SECRET_DOMAIN}`
- **Chart:** app-template v4.6.2
- **Storage:** 100Gi persistent volume
- **Dependencies:** attic-postgresql (Bitnami PostgreSQL 16.x, 5Gi)

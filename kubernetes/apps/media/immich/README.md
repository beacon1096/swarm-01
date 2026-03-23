# Immich

Self-hosted photo and video management.

- **Namespace:** media
- **Clusters:** Talos II only
- **Access:** Tailscale (`immich:2283`)
- **Chart:** app-template v4.6.2
- **Dependencies:** immich-pgvecto (PostgreSQL + pgvecto.rs, 10Gi), immich-redis
- **Storage:** 100Gi photo library, 10Gi ML model cache
- **Note:** PostgreSQL named `immich-pgvecto` (not `immich-postgresql`) to avoid Talos II Bitnami image override

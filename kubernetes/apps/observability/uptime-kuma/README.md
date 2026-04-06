# Uptime Kuma

Service uptime monitoring dashboard.

- **Namespace:** observability
- **Clusters:** Talos I only
- **Domain:** `status.${SECRET_DOMAIN}`
- **Chart:** uptime-kuma (OCI) v2.2.0
- **Storage:** 2Gi persistent volume
- **Ingress:** Reached through the Talos II Cloudflare Tunnel, which forwards `status.${SECRET_DOMAIN}` to the Talos I `envoy-external` Gateway

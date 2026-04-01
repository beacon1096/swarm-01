# Cloudflare Tunnel

Ingress tunnel from Cloudflare edge to cluster Envoy Gateway.

- **Namespace:** network
- **Clusters:** Talos II only
- **Chart:** cloudflare-tunnel (OCI) v2026.2.0
- **Config:** QUIC transport, post-quantum enabled, routes to envoy-external:443

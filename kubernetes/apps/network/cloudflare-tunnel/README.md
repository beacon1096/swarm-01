# Cloudflare Tunnel

Ingress tunnel from Cloudflare edge to cluster Envoy Gateway.

- **Namespace:** network
- **Clusters:** Talos II only
- **Chart:** cloudflare-tunnel (OCI) v2026.2.0
- **Config:** HTTP/2 transport, post-quantum disabled, routes to envoy-external:443
- **Note:** Talos II currently uses HTTP/2 because QUIC handshakes to Cloudflare edge were timing out and causing CrashLoopBackOff.

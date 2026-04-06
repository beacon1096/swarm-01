# Network Namespace

This directory manages the applications and configurations for the `network` namespace within the Kubernetes cluster.

## Applications

- **cloudflare-dns**: Configuration related to Cloudflare DNS resolution.
- **cloudflare-tunnel**: Secure connection to Cloudflare for Talos II public ingress only.
- **envoy-gateway**: An open source Kubernetes Gateway API implementation.
- **k8s-gateway**: Gateway configuration and routing setup.
- **tailscale**: A secure, fast mesh network.

Public hostnames continue to resolve through `external.${SECRET_DOMAIN}`. Talos I services that must stay public, such as `status.${SECRET_DOMAIN}`, need an explicit Cloudflare Tunnel ingress rule that forwards to the Talos I `envoy-external` Gateway.

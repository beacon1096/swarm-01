# Forgejo Runner

CI runner for Forgejo Actions.

- **Namespace:** development
- **Clusters:** Talos I only
- **Chart:** forgejo-runner (OCI) v12.7.1
- **Config:** Docker-in-Docker, ubuntu-latest + nix-builder labels, privileged mode, HTTP proxy via sing-box, Forgejo Actions control plane reached through `forgejo-ts.development.svc.cluster.local:3000` backed by Tailscale egress to Talos II

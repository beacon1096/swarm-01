# Forgejo Runner

CI runner for Forgejo Actions.

- **Namespace:** development
- **Clusters:** Talos I only
- **Chart:** forgejo-runner (OCI) `0.7.6` / runner `12.7.3`
- **Config:** Docker-in-Docker, ubuntu-latest + nix-builder labels, privileged mode, 12h runner job timeout, HTTP proxy via sing-box, Forgejo Actions control plane reached through `forgejo-ts.development.svc.cluster.local:3000` backed by Tailscale egress to Talos II

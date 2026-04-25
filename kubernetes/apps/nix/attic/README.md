# Attic

Nix binary cache server with multi-tenant support and PostgreSQL backend.

- **Namespace:** nix
- **Clusters:** Talos II only
- **Domain:** `nix.${SECRET_DOMAIN}`
- **Chart:** app-template v4.6.2
- **Storage:** 100Gi persistent volume
- **Dependencies:** attic-postgresql (Bitnami PostgreSQL 16.x, 5Gi)

## Pull token rotation

The Nix fleet currently uses a dedicated Attic pull token for daemon-backed
cache access. The token is stored in the Nix fleet repo as a SOPS-encrypted
secret at `/etc/nixos/secrets/shared/attic.yaml`, and the shared Nix module
renders it into a root-only `netrc-file` for `nix-daemon`.

### Recommended validity

- Use a **1 year** validity period for the shared `nix-daemon` pull token.
- Rotate early if the token is suspected to be exposed, if Attic permissions
  change, or before decommissioning any machine that can decrypt the shared
  secret.

### How to mint a replacement token

1. SSH to one of the Harvester hosts:
   - `ssh rancher@172.16.84.111`
   - `ssh rancher@172.16.84.112`
   - `ssh rancher@172.16.84.113`
2. Use the Harvester management cluster to exec into the `bootstrap-talos` pod
   in the `talos` namespace. That pod has both `talosctl` and `kubectl`, plus a
   secondary NIC on the Talos II workload network.
3. Generate a Talos II kubeconfig from `/configs/talosconfig`.
4. Exec into the Attic pod in namespace `nix` and mint a new token.

Reference command:

```sh
ssh rancher@172.16.84.111 "sudo -n /var/lib/rancher/rke2/bin/kubectl --kubeconfig /etc/rancher/rke2/rke2.yaml exec -i -n talos bootstrap-talos -- sh" <<'EOF'
set -e
/usr/local/bin/talosctl --talosconfig /configs/talosconfig --nodes 10.20.0.11 kubeconfig /tmp/talos-ii.kubeconfig >/dev/null
/usr/local/bin/kubectl --kubeconfig /tmp/talos-ii.kubeconfig exec -i -n nix deploy/attic -- sh <<'INNER'
set -e
atticadm -f /config/server.toml make-token --sub nix-daemon --validity 1y --pull nix-fleet
INNER
EOF
```

### How to roll out the replacement token

1. Update `/etc/nixos/secrets/shared/attic.yaml` with the new token value.
2. Encrypt the file with `sops -e -i /etc/nixos/secrets/shared/attic.yaml`.
3. Rebuild and switch each NixOS machine that imports `modules/common/attic-cache.nix`.
4. Verify authenticated cache access, for example by checking that
   `https://nix.${SECRET_DOMAIN}/nix-fleet/nix-cache-info` no longer returns
   `401 Unauthorized` when requested with the rotated netrc credentials.

### Notes

- Keep the token scoped to `--pull nix-fleet` unless a broader permission set is
  intentionally required.
- Do not paste plaintext tokens into docs, commits, issues, or comments.
- If rotation is due to compromise, mint the replacement first, roll it out to
  all machines, then revoke the old token via the normal Attic admin flow.

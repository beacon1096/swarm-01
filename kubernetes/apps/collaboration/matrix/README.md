# Matrix (Synapse)

Matrix homeserver with Element Web client.

- **Namespace:** collaboration
- **Clusters:** Talos II only
- **Domains:** `matrix.${SECRET_DOMAIN}`, `chat.${SECRET_DOMAIN}` (Element Web), `${SECRET_DOMAIN}/.well-known/matrix`
- **Chart:** matrix-synapse v3.12.22
- **Dependencies:** PostgreSQL (lc_collate=C) + Redis (auth enabled, 20Gi)
- **Config:** OIDC via Authentik, federation disabled, registration disabled, local service accounts allowed via `registration_shared_secret`

## Forgejo CI Webhook Account

For machine-to-machine senders such as Forgejo CI webhooks, prefer a dedicated local Matrix account instead of an interactive Authentik-backed user. Authentik remains the primary login path for humans, while Synapse's `registration_shared_secret` provides a controlled way to create non-human service accounts.

Recommended account shape:

- username: `forgejo-ci-webhook`
- MXID: `@forgejo-ci-webhook:${SECRET_DOMAIN}`
- purpose: receive CI or webhook notifications only
- auth model: local Matrix password login, not Authentik SSO

Suggested creation flow:

1. Create the local user with Synapse shared-secret registration from inside the cluster.
2. Log in once to obtain an access token if the webhook sender needs one.
3. Store the operational record in [`forgejo-ci-webhook-account.sops.yaml`](/Users/beacon/swarm-01/kubernetes/apps/collaboration/matrix/archive/forgejo-ci-webhook-account.sops.yaml).
4. Commit the updated encrypted archive back to the repo.

Example commands:

```bash
kubectl --server=https://100.115.149.55:6443 \
  --kubeconfig=talos-ii/clusterconfig/kubeconfig \
  --insecure-skip-tls-verify \
  -n collaboration exec deploy/matrix-synapse -- \
  register_new_matrix_user \
    --user forgejo-ci-webhook \
    --password '<strong-random-password>' \
    --no-admin \
    -k '<registration-shared-secret>' \
    http://localhost:8008
```

Then archive the account metadata with `sops`:

```bash
nix-shell -p sops --run "sops /Users/beacon/swarm-01/kubernetes/apps/collaboration/matrix/archive/forgejo-ci-webhook-account.sops.yaml"
```

Archive only the minimum operational data needed for recovery:

- Matrix user ID / localpart
- password or recovery credential
- access token if one was issued for automation
- message title or sender label conventions if they matter to downstream automation
- room IDs or intended destination rooms
- short purpose / ownership note

Do not place the archive file in the app kustomization; it is for versioned ops escrow only, not for deployment.

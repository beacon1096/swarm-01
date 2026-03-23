# Vaultwarden

Bitwarden-compatible password manager.

- **Namespace:** identity
- **Clusters:** Talos I, Talos II
- **Domain:** `vault.${SECRET_DOMAIN}`
- **Chart:** vaultwarden v0.35.1
- **Storage:** 5Gi
- **Config:** SSO via Authentik (PKCE), signups disabled, invitations enabled

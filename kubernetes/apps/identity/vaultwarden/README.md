# Vaultwarden

Bitwarden-compatible password manager.

- **Namespace:** identity
- **Clusters:** Talos II only
- **Domain:** `vault.${SECRET_DOMAIN}`
- **Chart:** vaultwarden v0.35.1
- **Storage:** 5Gi
- **Config:** SSO via Authentik (PKCE), signups disabled, invitations enabled

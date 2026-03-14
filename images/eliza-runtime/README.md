# Eliza runtime image

This directory is the permanent build context for the custom Eliza runtime used by `kubernetes/apps/ai/eliza/app/eliza.yaml`.

It fixes two things we already hit in-cluster:

- pins the mixed Eliza package set that currently works with Matrix
- includes `npm` so the Eliza CLI update check does not fail noisily at startup

## Local build

```bash
bash ./scripts/eliza-image-build.sh
```

Override defaults with environment variables:

```bash
IMAGE_REF=172.16.107.41:5000/custom/eliza-runtime:dev \
CONTAINER_ENGINE=podman \
PLATFORM=linux/amd64 \
PUSH=true \
bash ./scripts/eliza-image-build.sh
```

## CI shape

- `scripts/eliza-image-build.sh` is the shared entrypoint for local builds and CI runners
- `.github/workflows/eliza-image.yaml` builds on pull requests and can push on `main` or manual dispatch
- `.forgejo/workflows/eliza-image.yaml` is a minimal Forgejo Actions variant for your self-hosted runner
- if you move this into a dedicated repository or subrepository later, you can copy this directory plus the script and workflow with minimal changes

## Recommended long-term layout

If we want to maintain this independently, the cleanest next step is:

1. move `images/eliza-runtime/` and `scripts/eliza-image-build.sh` into a dedicated image repo
2. keep image tags immutable and update only the tag in `kubernetes/apps/ai/eliza/app/eliza.yaml`
3. let Forgejo Actions build and push to Zot on tag or main-branch changes

That keeps the runtime lifecycle separate from cluster manifests while still fitting Flux well.

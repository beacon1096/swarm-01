# Mem0 API image

This directory is the permanent build context for the custom Mem0 API image used by `kubernetes/apps/ai/mem0/app/helmrelease-mem0.yaml`.

Why this exists:

- the upstream `docker.io/mem0/mem0-api-server:latest` image is not reliably available for `linux/amd64`
- our deployment needs extra packages for the `pgvector + neo4j + ollama` path used by `kubernetes/apps/ai/mem0/app/configmap-main.yaml`
- installing those packages at container startup was slow and fragile, and it left rollouts dependent on runtime `pip install`

The image here bakes in the working package set observed in the currently running cluster pod.

## Local build

```bash
bash ./scripts/mem0-image-build.sh
```

Override defaults with environment variables:

```bash
IMAGE_REF=172.16.107.41:5000/custom/mem0-api-server:2026-03-13-1 \
CONTAINER_ENGINE=podman \
PLATFORM=linux/amd64 \
PUSH=true \
bash ./scripts/mem0-image-build.sh
```

## CI shape

- `scripts/mem0-image-build.sh` is the shared build entrypoint
- `.github/workflows/mem0-image.yaml` supports validation on pull requests and pushing on `main` or manual dispatch
- `.forgejo/workflows/mem0-image.yaml` is the Forgejo runner variant

## Recommended long-term layout

If we split image maintenance from cluster manifests later, move this directory plus the build script into a dedicated image repository and keep Flux consuming immutable tags only.

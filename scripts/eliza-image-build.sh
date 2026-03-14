#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
CONTEXT_DIR="${ROOT_DIR}/images/eliza-runtime"

IMAGE_REF="${IMAGE_REF:-zot.registry.svc.cluster.local:5000/custom/eliza-runtime:dev}"
PLATFORM="${PLATFORM:-linux/amd64}"
PUSH="${PUSH:-false}"
CONTAINER_ENGINE="${CONTAINER_ENGINE:-}"
NETWORK_MODE="${NETWORK_MODE:-}"

if [[ -z "${CONTAINER_ENGINE}" ]]; then
  if command -v podman >/dev/null 2>&1; then
    CONTAINER_ENGINE="podman"
  elif command -v docker >/dev/null 2>&1; then
    CONTAINER_ENGINE="docker"
  else
    echo "No supported container engine found (podman or docker)." >&2
    exit 1
  fi
fi

if [[ ! -d "${CONTEXT_DIR}" ]]; then
  echo "Build context not found: ${CONTEXT_DIR}" >&2
  exit 1
fi

case "${CONTAINER_ENGINE}" in
  podman)
    arch="${PLATFORM##*/}"
    cmd=(podman build --pull --platform "${PLATFORM}" --arch "${arch}" --override-arch "${arch}" -t "${IMAGE_REF}")
    if [[ -n "${NETWORK_MODE}" ]]; then
      cmd+=(--network "${NETWORK_MODE}")
    fi
    cmd+=("${CONTEXT_DIR}")
    "${cmd[@]}"
    if [[ "${PUSH}" == "true" ]]; then
      podman push "${IMAGE_REF}"
    fi
    ;;
  docker)
    cmd=(docker buildx build --pull --platform "${PLATFORM}" --tag "${IMAGE_REF}")
    if [[ -n "${NETWORK_MODE}" ]]; then
      cmd+=(--network "${NETWORK_MODE}")
    fi
    if [[ "${PUSH}" == "true" ]]; then
      cmd+=(--push)
    else
      cmd+=(--load)
    fi
    cmd+=("${CONTEXT_DIR}")
    "${cmd[@]}"
    ;;
  *)
    echo "Unsupported container engine: ${CONTAINER_ENGINE}" >&2
    exit 1
    ;;
esac

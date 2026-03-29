FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl ca-certificates fuse3 && \
    curl -fsSL https://install.tigerfs.io | sh && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/bin:$PATH"

ENTRYPOINT ["tigerfs"]

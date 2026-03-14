FROM docker.io/oven/bun:1.2.22

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN bun install --production --ignore-scripts

ENV NODE_ENV=production

CMD ["bun", "run", "/app/node_modules/@elizaos/cli/dist/index.js", "start", "--character=/app/characters/character.json"]

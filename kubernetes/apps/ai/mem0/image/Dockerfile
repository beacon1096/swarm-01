FROM docker.io/mem0/mem0-api-server:latest

RUN python -m pip install --no-cache-dir --default-timeout=100 --retries 10 \
    ollama \
    "psycopg[binary,pool]" \
    langchain-neo4j \
    rank-bm25

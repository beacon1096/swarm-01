# Mem0

Memory API for AI agents with graph and vector storage.

- **Namespace:** ai
- **Clusters:** Talos I only
- **Domain:** `memory.${SECRET_DOMAIN}`
- **Chart:** mem0 (OCI)
- **Dependencies:** mem0-postgresql (pgvector), mem0-neo4j v5.26.4, mem0-ollama (nomic-embed-text)
- **Config:** OpenAI-compat LLM (Qwen3-30B via omlx), 5Gi persistent volumes

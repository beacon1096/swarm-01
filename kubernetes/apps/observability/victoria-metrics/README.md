# Victoria Metrics

Full-stack metrics monitoring (VMSingle + VMAgent + VMAlert + Alertmanager + Grafana).

- **Namespace:** observability
- **Clusters:** Talos I only
- **Chart:** victoria-metrics-k8s-stack (OCI)
- **Storage:** VMSingle 20Gi, 90d retention
- **Config:** Scrape interval 30s, Grafana with Victoria plugins, cluster tag: swarm-01

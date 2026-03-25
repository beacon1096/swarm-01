# AGENTS.md

## 集群规划

### talos-i (172.16.107.x)
**定位：** 日志、监控、CI/CD 相关服务

**保留服务：**
- observability/* (victoria-metrics, victoria-logs, uptime-kuma, grafana)
- development/forgejo, forgejo-runner
- 任何 future CI/CD 工具

### talos-ii (10.20.0.x)
**定位：** 生产工作负载、AI 服务、协作工具

**运行服务：**
- ai/* (zeroclaw, mem0, eliza)
- collaboration/* (matrix-synapse)
- identity/* (authentik, vaultwarden)
- development/* (coder, atuin)
- home/*
- media/*
- nix/* (attic)
- registry/* (zot)
- network/*

## 重要规则

### 有状态服务部署原则
- **同一时刻，有状态服务只能部署在一个集群**
- 迁移时必须：先停止源集群 → 验证数据备份 → 部署到目标集群
- PVC 数据需要通过 Velero 或手动方式迁移

### 服务依赖关系
```
zeroclaw → matrix-synapse (collaboration namespace)
zeroclaw → mem0 (ai namespace)
eliza → matrix-synapse
eliza → mem0
```
zeroclaw 和 eliza 需要通过 Kubernetes 内部服务地址连接 matrix 和 mem0，因此必须部署在同一集群。

### 集群访问
- talos-i: `kubectl --kubeconfig kubeconfig ...`
- talos-ii: `kubectl --server=https://100.115.149.55:6443 --kubeconfig=talos-ii/clusterconfig/kubeconfig --insecure-skip-tls-verify ...`
  - 注意：Tailscale IP 不在 API Server 证书 SAN 中，需要 `--insecure-skip-tls-verify`

### Flux 部署
- 使用 `bootstrap/helmfile.d/` 进行初始部署
- Flux Kustomization 通过 `kubernetes/apps/*/ks.yaml` 管理应用
- 集群特定配置放在 `kubernetes/apps/*/talos-ii/` 目录下

### SOPS 加密
- Age key: `age.key` 在仓库根目录
- `.sops.yaml` 配置加密规则
- 解密：`nix-shell -p sops --run "sops decrypt <secret.sops.yaml"`

## 当前迁移状态

### 已迁移到 talos-ii ✅
- [x] mem0 (neo4j, postgresql, ollama)
- [x] matrix-synapse (新数据库，未迁移旧数据)
- [x] authentik
- [x] vaultwarden
- [x] coder
- [x] atuin
- [x] attic
- [x] zot
- [x] home-assistant
- [x] immich
- [x] navidrome
- [x] zeroclaw (已连接 matrix)

### 需保留在 talos-i ✅
- [x] victoria-metrics
- [x] victoria-logs
- [x] uptime-kuma
- [x] forgejo (CI/CD)
- [x] forgejo-runner

### 待处理
- [ ] OIDC 配置修复 (matrix → authentik SSO，等待证书签发)
- [ ] mem0 镜像需要推送到 zot registry
- [ ] 修复 talos-ii-03 NotReady 节点 (ms01-c 节点故障)
- [ ] matrix 旧数据迁移 (可选)
# AGENTS.md

## 集群规划

### talos-i (172.16.107.x)
**定位：** 日志、监控、CI/CD Runner

**保留服务：**
- observability/* (victoria-metrics, victoria-logs, uptime-kuma, grafana)
- development/forgejo-runner
- 任何 future CI/CD 工具

### talos-ii (10.20.0.x)
**定位：** 生产工作负载、AI 服务、协作工具、CI/CD

**运行服务：**
- ai/* (zeroclaw, mem0, eliza)
- collaboration/* (matrix-synapse)
- identity/* (authentik, vaultwarden)
- development/* (coder, atuin, forgejo, n8n)
- home/*
- media/*
- nix/* (attic)
- registry/* (zot)
- network/*

## 重要规则

### 文档维护
- **每次变动后，按需更新各级 README.md**
  - 根目录 README.md：整体架构和快速开始
  - `kubernetes/apps/*/README.md`：服务说明和配置
  - `bootstrap/README.md`：部署流程
- **凡是涉及服务启停、迁移、切换集群，必须同步更新对应 README（禁止只改清单不改文档）**
- **必须明确写清服务部署集群（talos-i / talos-ii），并与 `kubernetes/flux/talos-i/ks.yaml`、`kubernetes/flux/talos-ii/ks.yaml` 的 suspend 状态保持一致**
- 提交前自检：至少核对 `README.md`、`kubernetes/README.md`、对应 `kubernetes/apps/<namespace>/<app>/README.md`

### 域名配置规范
- **禁止在清单、文档或注释中写入硬编码的完整域名**
- 必须使用仓库既有替换变量（例如 `${SECRET_DOMAIN}`）或 Secret 引用来表达域名/端点
- 如需示例，请使用 `service.${SECRET_DOMAIN}` 这类形式，避免提交真实完整域名

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
- [x] forgejo (CI/CD artifact 存储需求)

### 需保留在 talos-i ✅
- [x] victoria-metrics
- [x] victoria-logs
- [x] uptime-kuma
- [x] forgejo-runner (通过公网连接 talos-ii 的 forgejo)

### 待处理
- [ ] mem0 镜像需要推送到 zot registry
- [ ] 修复 talos-ii-03 NotReady 节点 (ms01-c 节点故障)
- [ ] matrix 旧数据迁移 (可选)

## 集群特定配置

以下基础设施服务需要集群特定配置，已通过 Flux patch 处理：

| 服务 | 配置项 | talos-i | talos-ii |
|------|--------|---------|----------|
| cilium | IP Pool | 172.16.107.0/24 | 10.20.0.0/24 |
| envoy-gateway | LB IP | 172.16.107.31 | 10.20.0.200 |
| envoy-internal | LB IP | - | 10.20.0.201 |
| k8s-gateway | LB IP | - | 10.20.0.202 |
| spegel | mirror targets | [] | [http://10.20.0.203:5000] |
| cloudflare-dns | txtOwnerId | talos-i | talos-ii |
| harvester-csi-driver | path | app/ | talos-ii/ |

### 服务归属

**只在 talos-ii 运行：**
- cloudflare-tunnel (外部流量入口，`forgejo.${SECRET_DOMAIN}` 已排除)
- sing-box (代理)
- forgejo (CI/CD，通过 Tailscale 暴露给外部 VPS caddy 反代)

**两边都运行：**
- cert-manager (共用 Cloudflare API token)
- cilium, coredns, metrics-server, reloader
- cloudflare-dns (不同的 txtOwnerId)
- envoy-gateway, k8s-gateway
- tailscale-operator

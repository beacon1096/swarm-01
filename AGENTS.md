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
- ai/* (zeroclaw-kether, zeroclaw-chokmah, zeroclaw-binah, zeroclaw-yesod, zeroclaw-malkuth, mem0)
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
zeroclaw-* → matrix-synapse (collaboration namespace)
zeroclaw-* → mem0 (ai namespace, via MCP)
```
所有 zeroclaw agent 需要通过 Kubernetes 内部服务地址连接 matrix 和 mem0，因此必须部署在同一集群。

### 集群访问
- talos-i: `kubectl --kubeconfig kubeconfig ...`
- talos-ii: `kubectl --server=https://100.115.149.55:6443 --kubeconfig=talos-ii/clusterconfig/kubeconfig --insecure-skip-tls-verify ...`
  - 注意：Tailscale IP 不在 API Server 证书 SAN 中，需要 `--insecure-skip-tls-verify`

### 本地访问凭据与入口
- **原则：** 这里只记录本地凭据文件位置和使用方式，禁止把明文 token / secret 抄进文档、提交或评论里
- **Talos I kubeconfig：** `kubeconfig`
- **Talos II kubeconfig：** `talos-ii/clusterconfig/kubeconfig`
- **Talos I talosconfig：** `talos-i/clusterconfig/talosconfig`
- **Talos II talosconfig：** `talos-ii/clusterconfig/talosconfig`
- **Harvester kubeconfig（Talos I 底层）：** `talos-i-hvst.yaml`
- **Harvester kubeconfig（Talos II 底层）：** `talos-ii-hvst.yaml`
- **Harvester 通用 kubeconfig：** `harvester_kubeconfig`
- **Harvester 宿主机 SSH：** `ssh rancher@172.16.84.111` / `ssh rancher@172.16.84.112` / `ssh rancher@172.16.84.113`
- **SOPS Age key：** `age.key`
- **本地明文集群变量：** `cluster-secrets.yaml`
- **Cloudflare Tunnel 本地凭据：** `cloudflare-tunnel.json`
- **GitHub deploy key：** `github-deploy.key` / `github-deploy.key.pub`
- **GitHub push token：** `github-push-token.txt`
- **使用 `talosctl`：** `nix-shell -p talosctl`
- **使用 `sops`：** `nix-shell -p sops --run "sops decrypt <secret.sops.yaml>"`
- **注意：** 上述文件均视为本地运维凭据，默认不应改名、搬移、打印全文或提交到远端

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
- [x] n8n
- [x] home-assistant
- [x] immich
- [x] navidrome
- [x] zeroclaw-* (Sephiroth agents, v0.6.5)
- [x] forgejo (CI/CD artifact 存储需求)

### 需保留在 talos-i ✅
- [x] victoria-metrics
- [x] victoria-logs
- [x] uptime-kuma
- [x] forgejo-runner (通过公网连接 talos-ii 的 forgejo)

### 待处理
- [ ] mem0 镜像需要推送到 zot registry
- [ ] 修复 talos-ii-03 NotReady 节点 (ms01-c 节点故障)
  - 实质是 talos-ii Harvester 的 **OVN 控制面（ovn-central raft）三节点同步死循环**
  - 症状：
    - ms01-c 上 `kube-ovn-cni-ks2l5` 9000+ restart，启动卡在 `wait ovn0 gw ready`
    - 从 ms01-c debug pod ping 公网 100.64.0.1 OK，ping OVN gw `198.18.0.1` 100% 丢包
    - 三个 `ovn-central-*` pod (ms01-a/-b/-c 各一) 全部 0/1，restart 3000–3900 次
    - 启动日志一致：`ovsdb-client: failed to connect to "tcp:[172.16.84.{112,113}]:6641" (Connection refused)` → 30s 后 `terminating with signal 14 (Alarm clock)` → exit 0 → kubelet 重启
    - ms01-c 上 `/var/run/ovn/` 缺 `ovnsb_db.{pid,sock,ctl}`，比另外两节点更糟
  - 为什么 talos-ii VM 还能跑：ms01-a / ms01-b 上有崩溃前 OVS 流表的缓存；ms01-c 没缓存所以 0 起步过不了 OVN gw 检查
  - **维护前注意：千万别重启 ms01-a 或 ms01-b**，它们丢缓存即整个 talos-ii VM 网络瘫
  - 关键状态（2026-04-26 SSH 实勘 `/etc/origin/ovn/`）：
    - **ms01-b 是唯一真值源**：`ovnnb_db.db` 248 KB（Apr 16 05:50）、`ovnsb_db.db` 1.2 MB（Apr 16 05:50） + 多组备份（`*.bak` Mar 23、`*.oldcluster` Apr 5、`*.prejoin` Apr 13）
    - ms01-a：只剩 `ovnsb_db.db.standalone` 934 KB（Apr 13 13:12），NB DB 没了
    - ms01-c：仅 raft 元数据 227 B，NB/SB 实际内容全空
    - 还有 `/host/etc/origin/ovn.bak.20260404/` —— Apr 4 主动备份（NB 650 KB、SB 1.0 MB）
  - **关键约束：维护前严禁重启 ms01-b host**——它丢了即整个 talos-ii OVN 数据彻底丢失
  - 修复路径（实勘后版本）：
    1. 把 ms01-b 的 `ovnnb_db.db` / `ovnsb_db.db` 拷一份到本地或异地硬盘做硬备份
    2. `ovsdb-tool cluster-to-standalone` 把这两个 DB 从 raft 模式转单机
    3. `kubectl scale deploy ovn-central --replicas=0`
    4. 清空 ms01-a / ms01-c `/etc/origin/ovn/`
    5. standalone DB 放回 ms01-b 的 `/etc/origin/ovn/`
    6. `--replicas=1` 单节点先跑，验证 talos-ii VMs 通过 OVN 恢复
    7. `ovsdb-tool join-cluster` 把 ms01-a 和 ms01-c 以 follower 身份加入
  - ms01-c 单独再处理：清空 `/etc/openvswitch/conf.db` 让它以新 chassis 重加入；或走 Harvester UI decommission → re-add 流程
- [ ] matrix 旧数据迁移 (可选)
- [ ] 评估 `attic-ts` / `zot-ts` 在节点级 Tailscale 扩展后是否仍需要保留

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

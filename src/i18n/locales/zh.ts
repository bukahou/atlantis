import { Translations } from "@/types/i18n";

export const zh: Translations = {
  common: {
    siteName: "Atlantis 知识库",
    language: "语言",
    search: "搜索...",
    home: "首页",
    subcategories: "个子分类",
    viewMore: "查看更多",
    noContent: "暂无内容",
    moreItems: "更多",
    footer: "Atlantis 知识库",
  },
  nav: {
    infrastructure: {
      key: "infrastructure",
      label: "基础设施",
      children: [
        {
          key: "network",
          label: "网络",
          href: "/infrastructure/network",
          children: [
            { key: "osi-model", label: "OSI 模型", href: "/infrastructure/network/osi-model" },
            { key: "l1-physical", label: "L1 物理层", href: "/infrastructure/network/l1-physical" },
            { key: "l2-datalink", label: "L2 数据链路层", href: "/infrastructure/network/l2-datalink" },
            { key: "l3-network", label: "L3 网络层", href: "/infrastructure/network/l3-network" },
            { key: "l4-transport", label: "L4 传输层", href: "/infrastructure/network/l4-transport" },
            { key: "l7-application", label: "L7 应用层", href: "/infrastructure/network/l7-application" },
            { key: "load-balancer", label: "负载均衡", href: "/infrastructure/network/load-balancer" },
          ],
        },
        {
          key: "linux",
          label: "Linux",
          href: "/infrastructure/linux",
          children: [
            { key: "kernel", label: "内核", href: "/infrastructure/linux/kernel" },
            { key: "process", label: "进程与线程", href: "/infrastructure/linux/process" },
            { key: "memory", label: "内存管理", href: "/infrastructure/linux/memory" },
            { key: "storage", label: "存储管理", href: "/infrastructure/linux/storage" },
            { key: "network", label: "网络", href: "/infrastructure/linux/network" },
            { key: "service", label: "服务管理", href: "/infrastructure/linux/service" },
            { key: "shell", label: "Shell 脚本", href: "/infrastructure/linux/shell" },
          ],
        },
        {
          key: "cloud",
          label: "云服务",
          href: "/infrastructure/cloud",
          children: [
            { key: "aws", label: "AWS", href: "/infrastructure/cloud/aws" },
            { key: "gcp", label: "GCP", href: "/infrastructure/cloud/gcp" },
            { key: "azure", label: "Azure", href: "/infrastructure/cloud/azure" },
          ],
        },
      ],
    },
    container: {
      key: "container",
      label: "容器化",
      children: [
        {
          key: "basics",
          label: "容器基础",
          href: "/container/basics",
          children: [
            { key: "vm-vs-container", label: "VM vs 容器", href: "/container/basics/vm-vs-container" },
            { key: "image", label: "容器镜像", href: "/container/basics/image" },
          ],
        },
        {
          key: "docker",
          label: "Docker",
          href: "/container/docker",
          children: [
            { key: "basics", label: "基础", href: "/container/docker/basics" },
            { key: "networking", label: "网络", href: "/container/docker/networking" },
            { key: "storage", label: "存储", href: "/container/docker/storage" },
            { key: "compose", label: "Compose", href: "/container/docker/compose" },
            { key: "multistage", label: "多阶段构建", href: "/container/docker/multistage" },
          ],
        },
        {
          key: "kubernetes",
          label: "Kubernetes",
          href: "/container/kubernetes",
          children: [
            { key: "pod", label: "Pod", href: "/container/kubernetes/pod" },
            { key: "service", label: "Service 网络", href: "/container/kubernetes/service" },
            { key: "deployment", label: "Deployment", href: "/container/kubernetes/deployment" },
            { key: "workloads", label: "工作负载", href: "/container/kubernetes/workloads" },
            { key: "config", label: "配置管理", href: "/container/kubernetes/config" },
            { key: "storage", label: "存储", href: "/container/kubernetes/storage" },
            { key: "scheduling", label: "调度", href: "/container/kubernetes/scheduling" },
            { key: "operations", label: "运维", href: "/container/kubernetes/operations" },
            { key: "helm", label: "Helm", href: "/container/kubernetes/helm" },
          ],
        },
        {
          key: "service-mesh",
          label: "服务网格",
          href: "/container/service-mesh",
          children: [
            { key: "istio", label: "Istio", href: "/container/service-mesh/istio" },
            { key: "linkerd", label: "Linkerd", href: "/container/service-mesh/linkerd" },
          ],
        },
      ],
    },
    languages: {
      key: "languages",
      label: "编程语言",
      children: [
        {
          key: "compiled",
          label: "编译型",
          href: "/languages/compiled",
          children: [
            { key: "java", label: "Java", href: "/languages/compiled/java" },
            { key: "go", label: "Go", href: "/languages/compiled/go" },
            { key: "rust", label: "Rust", href: "/languages/compiled/rust" },
            { key: "typescript", label: "TypeScript", href: "/languages/compiled/typescript" },
          ],
        },
        {
          key: "scripting",
          label: "脚本型",
          href: "/languages/scripting",
          children: [
            { key: "python", label: "Python", href: "/languages/scripting/python" },
            { key: "php", label: "PHP", href: "/languages/scripting/php" },
            { key: "shell", label: "Shell", href: "/languages/scripting/shell" },
          ],
        },
        {
          key: "web",
          label: "Web 前端",
          href: "/languages/web",
          children: [
            { key: "html", label: "HTML", href: "/languages/web/html" },
            { key: "css", label: "CSS", href: "/languages/web/css" },
            { key: "javascript", label: "JavaScript", href: "/languages/web/javascript" },
            { key: "react", label: "React", href: "/languages/web/react" },
            { key: "vue", label: "Vue", href: "/languages/web/vue" },
          ],
        },
      ],
    },
    backend: {
      key: "backend",
      label: "后端",
      children: [
        {
          key: "api",
          label: "API 设计",
          href: "/backend/api",
          children: [
            { key: "restful", label: "RESTful", href: "/backend/api/restful" },
            { key: "graphql", label: "GraphQL", href: "/backend/api/graphql" },
            { key: "grpc", label: "gRPC", href: "/backend/api/grpc" },
          ],
        },
        {
          key: "microservices",
          label: "微服务",
          href: "/backend/microservices",
          children: [
            { key: "patterns", label: "架构模式", href: "/backend/microservices/patterns" },
            { key: "discovery", label: "服务发现", href: "/backend/microservices/discovery" },
            { key: "circuit-breaker", label: "熔断降级", href: "/backend/microservices/circuit-breaker" },
          ],
        },
        {
          key: "mq",
          label: "消息队列",
          href: "/backend/mq",
          children: [
            { key: "kafka", label: "Kafka", href: "/backend/mq/kafka" },
            { key: "rabbitmq", label: "RabbitMQ", href: "/backend/mq/rabbitmq" },
            { key: "redis-mq", label: "Redis", href: "/backend/mq/redis" },
          ],
        },
        {
          key: "webserver",
          label: "Web 服务器",
          href: "/backend/webserver",
          children: [
            { key: "nginx", label: "Nginx", href: "/backend/webserver/nginx" },
            { key: "apache", label: "Apache", href: "/backend/webserver/apache" },
            { key: "caddy", label: "Caddy", href: "/backend/webserver/caddy" },
          ],
        },
        {
          key: "proxy",
          label: "代理网关",
          href: "/backend/proxy",
          children: [
            { key: "haproxy", label: "HAProxy", href: "/backend/proxy/haproxy" },
            { key: "traefik", label: "Traefik", href: "/backend/proxy/traefik" },
            { key: "envoy", label: "Envoy", href: "/backend/proxy/envoy" },
          ],
        },
        {
          key: "cache",
          label: "缓存加速",
          href: "/backend/cache",
          children: [
            { key: "varnish", label: "Varnish", href: "/backend/cache/varnish" },
            { key: "cdn", label: "CDN", href: "/backend/cache/cdn" },
          ],
        },
      ],
    },
    database: {
      key: "database",
      label: "数据库",
      children: [
        {
          key: "relational",
          label: "关系型",
          href: "/database/relational",
          children: [
            { key: "mysql", label: "MySQL", href: "/database/relational/mysql" },
            { key: "postgresql", label: "PostgreSQL", href: "/database/relational/postgresql" },
          ],
        },
        {
          key: "nosql",
          label: "NoSQL",
          href: "/database/nosql",
          children: [
            { key: "mongodb", label: "MongoDB", href: "/database/nosql/mongodb" },
            { key: "redis", label: "Redis", href: "/database/nosql/redis" },
            { key: "elasticsearch", label: "Elasticsearch", href: "/database/nosql/elasticsearch" },
            { key: "dynamodb", label: "DynamoDB", href: "/database/nosql/dynamodb" },
          ],
        },
        {
          key: "distributed",
          label: "分布式",
          href: "/database/distributed",
          children: [
            { key: "tidb", label: "TiDB", href: "/database/distributed/tidb" },
          ],
        },
        {
          key: "modeling",
          label: "数据建模",
          href: "/database/modeling",
          children: [
            { key: "normalization", label: "范式设计", href: "/database/modeling/normalization" },
            { key: "indexing", label: "索引优化", href: "/database/modeling/indexing" },
            { key: "sharding", label: "分库分表", href: "/database/modeling/sharding" },
          ],
        },
      ],
    },
    architecture: {
      key: "architecture",
      label: "架构",
      children: [
        {
          key: "patterns",
          label: "设计模式",
          href: "/architecture/patterns",
          children: [
            { key: "creational", label: "创建型", href: "/architecture/patterns/creational" },
            { key: "structural", label: "结构型", href: "/architecture/patterns/structural" },
            { key: "behavioral", label: "行为型", href: "/architecture/patterns/behavioral" },
          ],
        },
        {
          key: "distributed",
          label: "分布式系统",
          href: "/architecture/distributed",
          children: [
            { key: "cap", label: "CAP 理论", href: "/architecture/distributed/cap" },
            { key: "consistency", label: "一致性模型", href: "/architecture/distributed/consistency" },
            { key: "transaction", label: "分布式事务", href: "/architecture/distributed/transaction" },
          ],
        },
        {
          key: "high-availability",
          label: "高可用",
          href: "/architecture/high-availability",
          children: [
            { key: "redundancy", label: "冗余设计", href: "/architecture/high-availability/redundancy" },
            { key: "failover", label: "故障转移", href: "/architecture/high-availability/failover" },
            { key: "disaster-recovery", label: "容灾备份", href: "/architecture/high-availability/disaster-recovery" },
          ],
        },
        {
          key: "ddd",
          label: "领域驱动",
          href: "/architecture/ddd",
          children: [
            { key: "bounded-context", label: "限界上下文", href: "/architecture/ddd/bounded-context" },
            { key: "aggregate", label: "聚合根", href: "/architecture/ddd/aggregate" },
            { key: "event-sourcing", label: "事件溯源", href: "/architecture/ddd/event-sourcing" },
          ],
        },
      ],
    },
    security: {
      key: "security",
      label: "安全",
      children: [
        {
          key: "auth",
          label: "认证授权",
          href: "/security/auth",
          children: [
            { key: "oauth", label: "OAuth 2.0", href: "/security/auth/oauth" },
            { key: "jwt", label: "JWT", href: "/security/auth/jwt" },
            { key: "rbac", label: "RBAC", href: "/security/auth/rbac" },
          ],
        },
        {
          key: "encryption",
          label: "加密技术",
          href: "/security/encryption",
          children: [
            { key: "symmetric", label: "对称加密", href: "/security/encryption/symmetric" },
            { key: "asymmetric", label: "非对称加密", href: "/security/encryption/asymmetric" },
            { key: "hash", label: "哈希算法", href: "/security/encryption/hash" },
          ],
        },
        {
          key: "network-security",
          label: "网络安全",
          href: "/security/network-security",
          children: [
            { key: "tls", label: "TLS/SSL", href: "/security/network-security/tls" },
            { key: "firewall", label: "防火墙", href: "/security/network-security/firewall" },
            { key: "waf", label: "WAF", href: "/security/network-security/waf" },
          ],
        },
        {
          key: "audit",
          label: "安全审计",
          href: "/security/audit",
          children: [
            { key: "logging", label: "审计日志", href: "/security/audit/logging" },
            { key: "vulnerability", label: "漏洞扫描", href: "/security/audit/vulnerability" },
            { key: "compliance", label: "合规检查", href: "/security/audit/compliance" },
          ],
        },
      ],
    },
    toolchain: {
      key: "toolchain",
      label: "工具链",
      children: [
        {
          key: "git",
          label: "Git",
          href: "/toolchain/git",
          children: [
            { key: "workflow", label: "工作流", href: "/toolchain/git/workflow" },
            { key: "branching", label: "分支策略", href: "/toolchain/git/branching" },
          ],
        },
        {
          key: "cicd",
          label: "CI/CD",
          href: "/toolchain/cicd",
          children: [
            { key: "github-actions", label: "GitHub Actions", href: "/toolchain/cicd/github-actions" },
            { key: "jenkins", label: "Jenkins", href: "/toolchain/cicd/jenkins" },
          ],
        },
        {
          key: "monitoring",
          label: "监控",
          href: "/toolchain/monitoring",
          children: [
            { key: "prometheus", label: "Prometheus", href: "/toolchain/monitoring/prometheus" },
            { key: "grafana", label: "Grafana", href: "/toolchain/monitoring/grafana" },
            { key: "logging", label: "日志系统", href: "/toolchain/monitoring/logging" },
            { key: "elk", label: "ELK 全栈", href: "/toolchain/monitoring/elk" },
            { key: "netdata", label: "Netdata", href: "/toolchain/monitoring/netdata" },
          ],
        },
      ],
    },
  },
  home: {
    title: "Atlantis 知识库",
    subtitle: "运维与开发知识体系",
    description: "系统化的技术知识体系，涵盖基础设施、容器化、编程语言、前后端开发等领域",
    philosophy: "技术无优劣之分，唯有适合与否——不追新潮，只求场景下的最优解",
    getStarted: "开始探索",
    categories: "知识分类",
  },
};

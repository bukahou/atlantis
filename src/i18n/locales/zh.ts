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
            { key: "tcp-ip", label: "TCP/IP", href: "/infrastructure/network/tcp-ip" },
            { key: "dns", label: "DNS", href: "/infrastructure/network/dns" },
            { key: "http", label: "HTTP/HTTPS", href: "/infrastructure/network/http" },
            { key: "load-balancer", label: "负载均衡", href: "/infrastructure/network/load-balancer" },
            { key: "cdn", label: "CDN", href: "/infrastructure/network/cdn" },
          ],
        },
        {
          key: "linux",
          label: "Linux",
          href: "/infrastructure/linux",
          children: [
            { key: "shell", label: "Shell 脚本", href: "/infrastructure/linux/shell" },
            { key: "system", label: "系统管理", href: "/infrastructure/linux/system" },
            { key: "performance", label: "性能调优", href: "/infrastructure/linux/performance" },
            { key: "security", label: "安全加固", href: "/infrastructure/linux/security" },
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
          key: "docker",
          label: "Docker",
          href: "/container/docker",
          children: [
            { key: "image", label: "镜像管理", href: "/container/docker/image" },
            { key: "container", label: "容器操作", href: "/container/docker/container" },
            { key: "compose", label: "Docker Compose", href: "/container/docker/compose" },
            { key: "network", label: "网络配置", href: "/container/docker/network" },
          ],
        },
        {
          key: "kubernetes",
          label: "Kubernetes",
          href: "/container/kubernetes",
          children: [
            { key: "pod", label: "Pod", href: "/container/kubernetes/pod" },
            { key: "service", label: "Service", href: "/container/kubernetes/service" },
            { key: "deployment", label: "Deployment", href: "/container/kubernetes/deployment" },
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
            { key: "go", label: "Go", href: "/languages/compiled/go" },
            { key: "rust", label: "Rust", href: "/languages/compiled/rust" },
          ],
        },
        {
          key: "scripting",
          label: "脚本型",
          href: "/languages/scripting",
          children: [
            { key: "python", label: "Python", href: "/languages/scripting/python" },
            { key: "shell", label: "Shell", href: "/languages/scripting/shell" },
          ],
        },
        {
          key: "web",
          label: "Web 开发",
          href: "/languages/web",
          children: [
            { key: "typescript", label: "TypeScript", href: "/languages/web/typescript" },
            { key: "javascript", label: "JavaScript", href: "/languages/web/javascript" },
          ],
        },
      ],
    },
    frontend: {
      key: "frontend",
      label: "前端",
      children: [
        {
          key: "react",
          label: "React/Next.js",
          href: "/frontend/react",
          children: [
            { key: "components", label: "组件开发", href: "/frontend/react/components" },
            { key: "hooks", label: "Hooks", href: "/frontend/react/hooks" },
            { key: "ssr", label: "SSR/SSG", href: "/frontend/react/ssr" },
          ],
        },
        {
          key: "vue",
          label: "Vue",
          href: "/frontend/vue",
          children: [
            { key: "composition", label: "组合式 API", href: "/frontend/vue/composition" },
            { key: "pinia", label: "Pinia", href: "/frontend/vue/pinia" },
          ],
        },
        {
          key: "css",
          label: "CSS",
          href: "/frontend/css",
          children: [
            { key: "tailwind", label: "Tailwind", href: "/frontend/css/tailwind" },
            { key: "animation", label: "动画效果", href: "/frontend/css/animation" },
            { key: "responsive", label: "响应式设计", href: "/frontend/css/responsive" },
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
          ],
        },
      ],
    },
  },
  home: {
    title: "Atlantis 知识库",
    subtitle: "运维与开发知识体系",
    description: "系统化的技术知识体系，涵盖基础设施、容器化、编程语言、前后端开发等领域",
    getStarted: "开始探索",
    categories: "知识分类",
  },
};

import { Translations } from "@/types/i18n";

export const ja: Translations = {
  common: {
    siteName: "Atlantis ナレッジベース",
    language: "言語",
    search: "検索...",
    home: "ホーム",
    subcategories: "個のサブカテゴリ",
    viewMore: "もっと見る",
    noContent: "コンテンツがありません",
  },
  nav: {
    infrastructure: {
      key: "infrastructure",
      label: "インフラ",
      children: [
        {
          key: "network",
          label: "ネットワーク",
          href: "/infrastructure/network",
          children: [
            { key: "tcp-ip", label: "TCP/IP", href: "/infrastructure/network/tcp-ip" },
            { key: "dns", label: "DNS", href: "/infrastructure/network/dns" },
            { key: "http", label: "HTTP/HTTPS", href: "/infrastructure/network/http" },
            { key: "load-balancer", label: "ロードバランサー", href: "/infrastructure/network/load-balancer" },
            { key: "cdn", label: "CDN", href: "/infrastructure/network/cdn" },
          ],
        },
        {
          key: "linux",
          label: "Linux",
          href: "/infrastructure/linux",
          children: [
            { key: "shell", label: "シェルスクリプト", href: "/infrastructure/linux/shell" },
            { key: "system", label: "システム管理", href: "/infrastructure/linux/system" },
            { key: "performance", label: "パフォーマンス", href: "/infrastructure/linux/performance" },
            { key: "security", label: "セキュリティ", href: "/infrastructure/linux/security" },
          ],
        },
        {
          key: "cloud",
          label: "クラウド",
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
      label: "コンテナ",
      children: [
        {
          key: "docker",
          label: "Docker",
          href: "/container/docker",
          children: [
            { key: "image", label: "イメージ管理", href: "/container/docker/image" },
            { key: "container", label: "コンテナ操作", href: "/container/docker/container" },
            { key: "compose", label: "Docker Compose", href: "/container/docker/compose" },
            { key: "network", label: "ネットワーク", href: "/container/docker/network" },
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
          label: "サービスメッシュ",
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
      label: "プログラミング言語",
      children: [
        {
          key: "compiled",
          label: "コンパイル型",
          href: "/languages/compiled",
          children: [
            { key: "go", label: "Go", href: "/languages/compiled/go" },
            { key: "rust", label: "Rust", href: "/languages/compiled/rust" },
          ],
        },
        {
          key: "scripting",
          label: "スクリプト型",
          href: "/languages/scripting",
          children: [
            { key: "python", label: "Python", href: "/languages/scripting/python" },
            { key: "shell", label: "Shell", href: "/languages/scripting/shell" },
          ],
        },
        {
          key: "web",
          label: "Web 開発",
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
      label: "フロントエンド",
      children: [
        {
          key: "react",
          label: "React/Next.js",
          href: "/frontend/react",
          children: [
            { key: "components", label: "コンポーネント", href: "/frontend/react/components" },
            { key: "hooks", label: "Hooks", href: "/frontend/react/hooks" },
            { key: "ssr", label: "SSR/SSG", href: "/frontend/react/ssr" },
          ],
        },
        {
          key: "vue",
          label: "Vue",
          href: "/frontend/vue",
          children: [
            { key: "composition", label: "Composition API", href: "/frontend/vue/composition" },
            { key: "pinia", label: "Pinia", href: "/frontend/vue/pinia" },
          ],
        },
        {
          key: "css",
          label: "CSS",
          href: "/frontend/css",
          children: [
            { key: "tailwind", label: "Tailwind", href: "/frontend/css/tailwind" },
            { key: "animation", label: "アニメーション", href: "/frontend/css/animation" },
            { key: "responsive", label: "レスポンシブ", href: "/frontend/css/responsive" },
          ],
        },
      ],
    },
    backend: {
      key: "backend",
      label: "バックエンド",
      children: [
        {
          key: "api",
          label: "API設計",
          href: "/backend/api",
          children: [
            { key: "restful", label: "RESTful", href: "/backend/api/restful" },
            { key: "graphql", label: "GraphQL", href: "/backend/api/graphql" },
            { key: "grpc", label: "gRPC", href: "/backend/api/grpc" },
          ],
        },
        {
          key: "microservices",
          label: "マイクロサービス",
          href: "/backend/microservices",
          children: [
            { key: "patterns", label: "アーキテクチャ", href: "/backend/microservices/patterns" },
            { key: "discovery", label: "サービス検出", href: "/backend/microservices/discovery" },
            { key: "circuit-breaker", label: "サーキットブレーカー", href: "/backend/microservices/circuit-breaker" },
          ],
        },
        {
          key: "mq",
          label: "メッセージキュー",
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
      label: "データベース",
      children: [
        {
          key: "relational",
          label: "リレーショナル",
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
          label: "データモデリング",
          href: "/database/modeling",
          children: [
            { key: "normalization", label: "正規化", href: "/database/modeling/normalization" },
            { key: "indexing", label: "インデックス", href: "/database/modeling/indexing" },
            { key: "sharding", label: "シャーディング", href: "/database/modeling/sharding" },
          ],
        },
      ],
    },
    toolchain: {
      key: "toolchain",
      label: "ツールチェーン",
      children: [
        {
          key: "git",
          label: "Git",
          href: "/toolchain/git",
          children: [
            { key: "workflow", label: "ワークフロー", href: "/toolchain/git/workflow" },
            { key: "branching", label: "ブランチ戦略", href: "/toolchain/git/branching" },
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
          label: "モニタリング",
          href: "/toolchain/monitoring",
          children: [
            { key: "prometheus", label: "Prometheus", href: "/toolchain/monitoring/prometheus" },
            { key: "grafana", label: "Grafana", href: "/toolchain/monitoring/grafana" },
            { key: "logging", label: "ログ管理", href: "/toolchain/monitoring/logging" },
          ],
        },
      ],
    },
  },
  home: {
    title: "Atlantis ナレッジベース",
    subtitle: "運用・開発ナレッジシステム",
    description: "インフラ、コンテナ、プログラミング言語、フロントエンド・バックエンド開発を網羅した体系的な技術知識ベース",
    getStarted: "はじめる",
    categories: "カテゴリ",
  },
};

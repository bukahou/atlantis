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
    moreItems: "件以上",
    footer: "Atlantis ナレッジベース",
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
            { key: "osi-model", label: "OSI モデル", href: "/infrastructure/network/osi-model" },
            { key: "l1-physical", label: "L1 物理層", href: "/infrastructure/network/l1-physical" },
            { key: "l2-datalink", label: "L2 データリンク層", href: "/infrastructure/network/l2-datalink" },
            { key: "l3-network", label: "L3 ネットワーク層", href: "/infrastructure/network/l3-network" },
            { key: "l4-transport", label: "L4 トランスポート層", href: "/infrastructure/network/l4-transport" },
            { key: "l7-application", label: "L7 アプリケーション層", href: "/infrastructure/network/l7-application" },
            { key: "load-balancer", label: "ロードバランサー", href: "/infrastructure/network/load-balancer" },
          ],
        },
        {
          key: "linux",
          label: "Linux",
          href: "/infrastructure/linux",
          children: [
            { key: "kernel", label: "カーネル", href: "/infrastructure/linux/kernel" },
            { key: "process", label: "プロセス・スレッド", href: "/infrastructure/linux/process" },
            { key: "memory", label: "メモリ管理", href: "/infrastructure/linux/memory" },
            { key: "storage", label: "ストレージ", href: "/infrastructure/linux/storage" },
            { key: "network", label: "ネットワーク", href: "/infrastructure/linux/network" },
            { key: "service", label: "サービス管理", href: "/infrastructure/linux/service" },
            { key: "shell", label: "シェルスクリプト", href: "/infrastructure/linux/shell" },
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
          key: "basics",
          label: "コンテナ基礎",
          href: "/container/basics",
          children: [
            { key: "vm-vs-container", label: "VM vs コンテナ", href: "/container/basics/vm-vs-container" },
            { key: "image", label: "コンテナイメージ", href: "/container/basics/image" },
          ],
        },
        {
          key: "docker",
          label: "Docker",
          href: "/container/docker",
          children: [
            { key: "basics", label: "基礎", href: "/container/docker/basics" },
            { key: "networking", label: "ネットワーク", href: "/container/docker/networking" },
            { key: "storage", label: "ストレージ", href: "/container/docker/storage" },
            { key: "compose", label: "Compose", href: "/container/docker/compose" },
            { key: "multistage", label: "マルチステージ", href: "/container/docker/multistage" },
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
            { key: "workloads", label: "ワークロード", href: "/container/kubernetes/workloads" },
            { key: "config", label: "設定管理", href: "/container/kubernetes/config" },
            { key: "storage", label: "ストレージ", href: "/container/kubernetes/storage" },
            { key: "scheduling", label: "スケジューリング", href: "/container/kubernetes/scheduling" },
            { key: "operations", label: "運用", href: "/container/kubernetes/operations" },
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
            { key: "java", label: "Java", href: "/languages/compiled/java" },
            { key: "go", label: "Go", href: "/languages/compiled/go" },
            { key: "rust", label: "Rust", href: "/languages/compiled/rust" },
            { key: "typescript", label: "TypeScript", href: "/languages/compiled/typescript" },
          ],
        },
        {
          key: "scripting",
          label: "スクリプト型",
          href: "/languages/scripting",
          children: [
            { key: "python", label: "Python", href: "/languages/scripting/python" },
            { key: "php", label: "PHP", href: "/languages/scripting/php" },
            { key: "shell", label: "Shell", href: "/languages/scripting/shell" },
          ],
        },
        {
          key: "web",
          label: "Web フロントエンド",
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
        {
          key: "webserver",
          label: "Web サーバー",
          href: "/backend/webserver",
          children: [
            { key: "nginx", label: "Nginx", href: "/backend/webserver/nginx" },
            { key: "apache", label: "Apache", href: "/backend/webserver/apache" },
            { key: "caddy", label: "Caddy", href: "/backend/webserver/caddy" },
          ],
        },
        {
          key: "proxy",
          label: "プロキシ・ゲートウェイ",
          href: "/backend/proxy",
          children: [
            { key: "haproxy", label: "HAProxy", href: "/backend/proxy/haproxy" },
            { key: "traefik", label: "Traefik", href: "/backend/proxy/traefik" },
            { key: "envoy", label: "Envoy", href: "/backend/proxy/envoy" },
          ],
        },
        {
          key: "cache",
          label: "キャッシュ",
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
            { key: "dynamodb", label: "DynamoDB", href: "/database/nosql/dynamodb" },
          ],
        },
        {
          key: "distributed",
          label: "分散型",
          href: "/database/distributed",
          children: [
            { key: "tidb", label: "TiDB", href: "/database/distributed/tidb" },
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
    architecture: {
      key: "architecture",
      label: "アーキテクチャ",
      children: [
        {
          key: "patterns",
          label: "デザインパターン",
          href: "/architecture/patterns",
          children: [
            { key: "creational", label: "生成パターン", href: "/architecture/patterns/creational" },
            { key: "structural", label: "構造パターン", href: "/architecture/patterns/structural" },
            { key: "behavioral", label: "振る舞いパターン", href: "/architecture/patterns/behavioral" },
          ],
        },
        {
          key: "distributed",
          label: "分散システム",
          href: "/architecture/distributed",
          children: [
            { key: "cap", label: "CAP 定理", href: "/architecture/distributed/cap" },
            { key: "consistency", label: "一貫性モデル", href: "/architecture/distributed/consistency" },
            { key: "transaction", label: "分散トランザクション", href: "/architecture/distributed/transaction" },
          ],
        },
        {
          key: "high-availability",
          label: "高可用性",
          href: "/architecture/high-availability",
          children: [
            { key: "redundancy", label: "冗長化設計", href: "/architecture/high-availability/redundancy" },
            { key: "failover", label: "フェイルオーバー", href: "/architecture/high-availability/failover" },
            { key: "disaster-recovery", label: "災害復旧", href: "/architecture/high-availability/disaster-recovery" },
          ],
        },
        {
          key: "ddd",
          label: "ドメイン駆動",
          href: "/architecture/ddd",
          children: [
            { key: "bounded-context", label: "境界づけられたコンテキスト", href: "/architecture/ddd/bounded-context" },
            { key: "aggregate", label: "集約ルート", href: "/architecture/ddd/aggregate" },
            { key: "event-sourcing", label: "イベントソーシング", href: "/architecture/ddd/event-sourcing" },
          ],
        },
      ],
    },
    security: {
      key: "security",
      label: "セキュリティ",
      children: [
        {
          key: "auth",
          label: "認証・認可",
          href: "/security/auth",
          children: [
            { key: "oauth", label: "OAuth 2.0", href: "/security/auth/oauth" },
            { key: "jwt", label: "JWT", href: "/security/auth/jwt" },
            { key: "rbac", label: "RBAC", href: "/security/auth/rbac" },
          ],
        },
        {
          key: "encryption",
          label: "暗号化技術",
          href: "/security/encryption",
          children: [
            { key: "symmetric", label: "共通鍵暗号", href: "/security/encryption/symmetric" },
            { key: "asymmetric", label: "公開鍵暗号", href: "/security/encryption/asymmetric" },
            { key: "hash", label: "ハッシュアルゴリズム", href: "/security/encryption/hash" },
          ],
        },
        {
          key: "network-security",
          label: "ネットワークセキュリティ",
          href: "/security/network-security",
          children: [
            { key: "tls", label: "TLS/SSL", href: "/security/network-security/tls" },
            { key: "firewall", label: "ファイアウォール", href: "/security/network-security/firewall" },
            { key: "waf", label: "WAF", href: "/security/network-security/waf" },
          ],
        },
        {
          key: "audit",
          label: "セキュリティ監査",
          href: "/security/audit",
          children: [
            { key: "logging", label: "監査ログ", href: "/security/audit/logging" },
            { key: "vulnerability", label: "脆弱性スキャン", href: "/security/audit/vulnerability" },
            { key: "compliance", label: "コンプライアンス", href: "/security/audit/compliance" },
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
            { key: "elk", label: "ELK スタック", href: "/toolchain/monitoring/elk" },
            { key: "netdata", label: "Netdata", href: "/toolchain/monitoring/netdata" },
          ],
        },
      ],
    },
  },
  home: {
    title: "Atlantis ナレッジベース",
    subtitle: "運用・開発ナレッジシステム",
    description: "インフラ、コンテナ、プログラミング言語、フロントエンド・バックエンド開発を網羅した体系的な技術知識ベース",
    philosophy: "技術に優劣はなく、最適解があるのみ——新しさより、状況に応じた選択を",
    getStarted: "はじめる",
    categories: "カテゴリ",
  },
};

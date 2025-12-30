---
title: サービスディスカバリ
description: マイクロサービスのサービスディスカバリ機構、レジストリとロードバランシング
order: 2
tags:
  - microservices
  - discovery
  - consul
  - etcd
---

# サービスディスカバリ

## サービスディスカバリ概要

サービスディスカバリにより、分散環境でサービスが他のサービスを動的に発見でき、マイクロサービスアーキテクチャのコアインフラです。

```
サービスディスカバリフロー
├── サービス登録 - サービス起動時に登録
├── ヘルスチェック - 定期的にサービス状態を検査
├── サービス照会 - クライアントがサービス一覧を取得
├── ロードバランシング - ターゲットインスタンス選択
└── サービス登録解除 - サービス停止時に削除
```

## サービスレジストリ

### Consul

```hcl
# Consul サービス定義
service {
  name = "user-service"
  id   = "user-service-1"
  port = 8080
  tags = ["v1", "primary"]

  check {
    http     = "http://localhost:8080/health"
    interval = "10s"
    timeout  = "3s"
  }

  meta {
    version = "1.0.0"
    region  = "us-east-1"
  }
}
```

```go
// Go サービス登録
import "github.com/hashicorp/consul/api"

func RegisterService(client *api.Client) error {
    registration := &api.AgentServiceRegistration{
        ID:      "user-service-1",
        Name:    "user-service",
        Port:    8080,
        Address: "192.168.1.100",
        Tags:    []string{"v1", "primary"},
        Check: &api.AgentServiceCheck{
            HTTP:                           "http://192.168.1.100:8080/health",
            Interval:                       "10s",
            Timeout:                        "3s",
            DeregisterCriticalServiceAfter: "1m",
        },
    }
    return client.Agent().ServiceRegister(registration)
}

// サービス発見
func DiscoverService(client *api.Client, serviceName string) ([]*api.ServiceEntry, error) {
    services, _, err := client.Health().Service(serviceName, "", true, nil)
    return services, err
}
```

### etcd

```go
// etcd サービス登録
import clientv3 "go.etcd.io/etcd/client/v3"

func RegisterService(client *clientv3.Client, serviceName, addr string) error {
    ctx := context.Background()

    // リース作成
    lease, _ := client.Grant(ctx, 10)

    // サービス登録
    key := fmt.Sprintf("/services/%s/%s", serviceName, addr)
    _, err := client.Put(ctx, key, addr, clientv3.WithLease(lease.ID))
    if err != nil {
        return err
    }

    // リース維持
    ch, _ := client.KeepAlive(ctx, lease.ID)
    go func() {
        for range ch {
            // リース更新
        }
    }()

    return nil
}

// サービス発見
func DiscoverService(client *clientv3.Client, serviceName string) ([]string, error) {
    ctx := context.Background()
    prefix := fmt.Sprintf("/services/%s/", serviceName)
    resp, err := client.Get(ctx, prefix, clientv3.WithPrefix())
    if err != nil {
        return nil, err
    }

    var addrs []string
    for _, kv := range resp.Kvs {
        addrs = append(addrs, string(kv.Value))
    }
    return addrs, nil
}

// 変更監視
func WatchService(client *clientv3.Client, serviceName string) {
    prefix := fmt.Sprintf("/services/%s/", serviceName)
    watchChan := client.Watch(context.Background(), prefix, clientv3.WithPrefix())

    for watchResp := range watchChan {
        for _, event := range watchResp.Events {
            switch event.Type {
            case clientv3.EventTypePut:
                fmt.Println("Service added:", string(event.Kv.Value))
            case clientv3.EventTypeDelete:
                fmt.Println("Service removed:", string(event.Kv.Key))
            }
        }
    }
}
```

### Kubernetes サービスディスカバリ

```yaml
# Service 定義
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
---
# Endpoints 自動管理
# DNS でアクセス: user-service.default.svc.cluster.local
```

```go
// K8s でサービス発見
// 1. DNS 方式
resp, _ := http.Get("http://user-service:80/api/users")

// 2. API 方式
import "k8s.io/client-go/kubernetes"

func GetEndpoints(clientset *kubernetes.Clientset, namespace, serviceName string) ([]string, error) {
    endpoints, err := clientset.CoreV1().Endpoints(namespace).Get(
        context.Background(), serviceName, metav1.GetOptions{})
    if err != nil {
        return nil, err
    }

    var addrs []string
    for _, subset := range endpoints.Subsets {
        for _, addr := range subset.Addresses {
            for _, port := range subset.Ports {
                addrs = append(addrs, fmt.Sprintf("%s:%d", addr.IP, port.Port))
            }
        }
    }
    return addrs, nil
}
```

## ロードバランシング

### ロードバランシング戦略

```go
// ラウンドロビン
type RoundRobin struct {
    instances []string
    current   int
    mu        sync.Mutex
}

func (r *RoundRobin) Next() string {
    r.mu.Lock()
    defer r.mu.Unlock()
    instance := r.instances[r.current]
    r.current = (r.current + 1) % len(r.instances)
    return instance
}

// 重み付けラウンドロビン
type WeightedRoundRobin struct {
    instances []Instance
    current   int
}

type Instance struct {
    Addr   string
    Weight int
}

// ランダム
func Random(instances []string) string {
    return instances[rand.Intn(len(instances))]
}

// 最少接続
type LeastConnections struct {
    instances map[string]*atomic.Int32
}

func (lc *LeastConnections) Next() string {
    var minAddr string
    var minConn int32 = math.MaxInt32
    for addr, conn := range lc.instances {
        if conn.Load() < minConn {
            minAddr = addr
            minConn = conn.Load()
        }
    }
    lc.instances[minAddr].Add(1)
    return minAddr
}

// コンシステントハッシュ
type ConsistentHash struct {
    ring     map[uint32]string
    sortedKeys []uint32
    replicas int
}

func (ch *ConsistentHash) Get(key string) string {
    hash := crc32.ChecksumIEEE([]byte(key))
    idx := sort.Search(len(ch.sortedKeys), func(i int) bool {
        return ch.sortedKeys[i] >= hash
    })
    if idx == len(ch.sortedKeys) {
        idx = 0
    }
    return ch.ring[ch.sortedKeys[idx]]
}
```

## ヘルスチェック

```go
// HTTP ヘルスチェック
func healthHandler(w http.ResponseWriter, r *http.Request) {
    // 依存関係チェック
    if err := checkDatabase(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "unhealthy",
            "error":  err.Error(),
        })
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "healthy",
    })
}

// Readiness プローブ
func readinessHandler(w http.ResponseWriter, r *http.Request) {
    if !isReady {
        w.WriteHeader(http.StatusServiceUnavailable)
        return
    }
    w.WriteHeader(http.StatusOK)
}

// Liveness プローブ
func livenessHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
}
```

```yaml
# Kubernetes プローブ設定
spec:
  containers:
    - name: app
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
        initialDelaySeconds: 15
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 5
```

## まとめ

サービスディスカバリのポイント：

1. **レジストリ** - Consul、etcd、K8s DNS
2. **ヘルスチェック** - HTTP、TCP、gRPC
3. **ロードバランシング** - ラウンドロビン、ランダム、コンシステントハッシュ
4. **サービス監視** - リアルタイムでサービス変更を検知
5. **グレースフルシャットダウン** - 登録解除とトラフィックドレイン

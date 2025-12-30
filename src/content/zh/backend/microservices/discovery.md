---
title: 服务发现
description: 微服务服务发现机制、注册中心与负载均衡
order: 2
tags:
  - microservices
  - discovery
  - consul
  - etcd
---

# 服务发现

## 服务发现概述

服务发现允许服务在分布式环境中动态找到其他服务，是微服务架构的核心基础设施。

```
服务发现流程
├── 服务注册 - 服务启动时注册
├── 健康检查 - 定期检测服务状态
├── 服务查询 - 客户端获取服务列表
├── 负载均衡 - 选择目标实例
└── 服务注销 - 服务下线时移除
```

## 注册中心

### Consul

```hcl
# Consul 服务定义
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
// Go 服务注册
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

// 服务发现
func DiscoverService(client *api.Client, serviceName string) ([]*api.ServiceEntry, error) {
    services, _, err := client.Health().Service(serviceName, "", true, nil)
    return services, err
}
```

### etcd

```go
// etcd 服务注册
import clientv3 "go.etcd.io/etcd/client/v3"

func RegisterService(client *clientv3.Client, serviceName, addr string) error {
    ctx := context.Background()

    // 创建租约
    lease, _ := client.Grant(ctx, 10)

    // 注册服务
    key := fmt.Sprintf("/services/%s/%s", serviceName, addr)
    _, err := client.Put(ctx, key, addr, clientv3.WithLease(lease.ID))
    if err != nil {
        return err
    }

    // 保持租约
    ch, _ := client.KeepAlive(ctx, lease.ID)
    go func() {
        for range ch {
            // 租约续期
        }
    }()

    return nil
}

// 服务发现
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

// 监听变化
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

### Kubernetes 服务发现

```yaml
# Service 定义
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
# Endpoints 自动管理
# 通过 DNS 访问: user-service.default.svc.cluster.local
```

```go
// 在 K8s 中发现服务
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

## 负载均衡

### 负载均衡策略

```go
// 轮询
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

// 加权轮询
type WeightedRoundRobin struct {
    instances []Instance
    current   int
}

type Instance struct {
    Addr   string
    Weight int
}

// 随机
func Random(instances []string) string {
    return instances[rand.Intn(len(instances))]
}

// 最少连接
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

// 一致性哈希
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

## 健康检查

```go
// HTTP 健康检查
func healthHandler(w http.ResponseWriter, r *http.Request) {
    // 检查依赖
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

// 就绪探针
func readinessHandler(w http.ResponseWriter, r *http.Request) {
    if !isReady {
        w.WriteHeader(http.StatusServiceUnavailable)
        return
    }
    w.WriteHeader(http.StatusOK)
}

// 存活探针
func livenessHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
}
```

```yaml
# Kubernetes 探针配置
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

## 总结

服务发现要点：

1. **注册中心** - Consul、etcd、K8s DNS
2. **健康检查** - HTTP、TCP、gRPC
3. **负载均衡** - 轮询、随机、一致性哈希
4. **服务监听** - 实时感知服务变化
5. **优雅下线** - 注销与流量排空

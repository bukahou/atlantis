---
title: gRPC
description: gRPC 协议、Protocol Buffers 与服务间通信
order: 3
tags:
  - api
  - grpc
  - protobuf
  - rpc
---

# gRPC

## gRPC 概述

gRPC 是 Google 开发的高性能 RPC 框架，使用 Protocol Buffers 作为接口定义语言和消息序列化格式。

```
gRPC 特点
├── 高性能 - 二进制序列化、HTTP/2
├── 强类型 - Protocol Buffers 定义
├── 多语言 - 支持多种编程语言
├── 流式传输 - 支持双向流
└── 代码生成 - 自动生成客户端和服务端代码
```

## Protocol Buffers

### 基本语法

```protobuf
// user.proto
syntax = "proto3";

package user.v1;

option go_package = "github.com/example/user/v1";

// 消息定义
message User {
  string id = 1;
  string name = 2;
  string email = 3;
  UserRole role = 4;
  repeated string tags = 5;
  optional string bio = 6;
  google.protobuf.Timestamp created_at = 7;
}

// 枚举
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;
  USER_ROLE_ADMIN = 1;
  USER_ROLE_USER = 2;
  USER_ROLE_GUEST = 3;
}

// 嵌套消息
message Address {
  string street = 1;
  string city = 2;
  string country = 3;
}

message UserProfile {
  User user = 1;
  Address address = 2;
}
```

### 标量类型

```protobuf
// 数值类型
int32, int64       // 有符号整数
uint32, uint64     // 无符号整数
sint32, sint64     // 有符号 (ZigZag 编码)
fixed32, fixed64   // 固定长度无符号
sfixed32, sfixed64 // 固定长度有符号
float, double      // 浮点数

// 其他类型
bool               // 布尔值
string             // UTF-8 字符串
bytes              // 任意字节序列
```

### 服务定义

```protobuf
// 服务定义
service UserService {
  // 一元 RPC
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);

  // 服务端流
  rpc ListUsers(ListUsersRequest) returns (stream User);

  // 客户端流
  rpc CreateUsers(stream CreateUserRequest) returns (CreateUsersResponse);

  // 双向流
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

// 请求消息
message GetUserRequest {
  string id = 1;
}

message GetUserResponse {
  User user = 1;
}

message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
  UserFilter filter = 3;
}

message UserFilter {
  optional UserRole role = 1;
  optional string name_contains = 2;
}
```

## 服务实现

### Go 服务端

```go
// server.go
package main

import (
    "context"
    "log"
    "net"

    "google.golang.org/grpc"
    pb "github.com/example/user/v1"
)

type userServer struct {
    pb.UnimplementedUserServiceServer
    users map[string]*pb.User
}

func (s *userServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
    user, ok := s.users[req.Id]
    if !ok {
        return nil, status.Errorf(codes.NotFound, "user not found: %s", req.Id)
    }
    return &pb.GetUserResponse{User: user}, nil
}

func (s *userServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.CreateUserResponse, error) {
    user := &pb.User{
        Id:    uuid.New().String(),
        Name:  req.Name,
        Email: req.Email,
    }
    s.users[user.Id] = user
    return &pb.CreateUserResponse{User: user}, nil
}

// 服务端流
func (s *userServer) ListUsers(req *pb.ListUsersRequest, stream pb.UserService_ListUsersServer) error {
    for _, user := range s.users {
        if err := stream.Send(user); err != nil {
            return err
        }
    }
    return nil
}

func main() {
    lis, _ := net.Listen("tcp", ":50051")
    grpcServer := grpc.NewServer()
    pb.RegisterUserServiceServer(grpcServer, &userServer{
        users: make(map[string]*pb.User),
    })
    log.Fatal(grpcServer.Serve(lis))
}
```

### Go 客户端

```go
// client.go
package main

import (
    "context"
    "io"
    "log"

    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
    pb "github.com/example/user/v1"
)

func main() {
    conn, _ := grpc.Dial("localhost:50051",
        grpc.WithTransportCredentials(insecure.NewCredentials()))
    defer conn.Close()

    client := pb.NewUserServiceClient(conn)

    // 一元调用
    resp, err := client.GetUser(context.Background(), &pb.GetUserRequest{
        Id: "123",
    })
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("User: %v", resp.User)

    // 服务端流
    stream, _ := client.ListUsers(context.Background(), &pb.ListUsersRequest{})
    for {
        user, err := stream.Recv()
        if err == io.EOF {
            break
        }
        log.Printf("User: %v", user)
    }
}
```

## 流式传输

### 四种模式

```
1. 一元 RPC
   Client -> Server: Request
   Server -> Client: Response

2. 服务端流
   Client -> Server: Request
   Server -> Client: Response1, Response2, ...

3. 客户端流
   Client -> Server: Request1, Request2, ...
   Server -> Client: Response

4. 双向流
   Client <-> Server: 双向消息流
```

### 双向流示例

```go
// 服务端
func (s *chatServer) Chat(stream pb.ChatService_ChatServer) error {
    for {
        msg, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        // 处理消息
        response := &pb.ChatMessage{
            Content: "Echo: " + msg.Content,
        }
        if err := stream.Send(response); err != nil {
            return err
        }
    }
}

// 客户端
stream, _ := client.Chat(context.Background())
go func() {
    for {
        msg, err := stream.Recv()
        if err == io.EOF {
            return
        }
        log.Printf("Received: %s", msg.Content)
    }
}()

stream.Send(&pb.ChatMessage{Content: "Hello"})
stream.Send(&pb.ChatMessage{Content: "World"})
stream.CloseSend()
```

## 拦截器

```go
// 一元拦截器
func loggingInterceptor(
    ctx context.Context,
    req interface{},
    info *grpc.UnaryServerInfo,
    handler grpc.UnaryHandler,
) (interface{}, error) {
    start := time.Now()
    resp, err := handler(ctx, req)
    log.Printf("Method: %s, Duration: %v, Error: %v",
        info.FullMethod, time.Since(start), err)
    return resp, err
}

// 流拦截器
func streamInterceptor(
    srv interface{},
    ss grpc.ServerStream,
    info *grpc.StreamServerInfo,
    handler grpc.StreamHandler,
) error {
    log.Printf("Stream started: %s", info.FullMethod)
    return handler(srv, ss)
}

// 注册拦截器
server := grpc.NewServer(
    grpc.UnaryInterceptor(loggingInterceptor),
    grpc.StreamInterceptor(streamInterceptor),
)
```

## 错误处理

```go
import "google.golang.org/grpc/codes"
import "google.golang.org/grpc/status"

// 返回错误
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
    if req.Id == "" {
        return nil, status.Errorf(codes.InvalidArgument, "id is required")
    }

    user, err := s.db.GetUser(req.Id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, status.Errorf(codes.NotFound, "user not found")
        }
        return nil, status.Errorf(codes.Internal, "internal error")
    }

    return &pb.GetUserResponse{User: user}, nil
}

// 处理错误
resp, err := client.GetUser(ctx, req)
if err != nil {
    st, ok := status.FromError(err)
    if ok {
        switch st.Code() {
        case codes.NotFound:
            // 处理 NotFound
        case codes.InvalidArgument:
            // 处理参数错误
        }
    }
}
```

## 总结

gRPC 要点：

1. **Protocol Buffers** - 强类型接口定义
2. **高性能** - 二进制序列化 + HTTP/2
3. **流式传输** - 四种 RPC 模式
4. **拦截器** - 横切关注点处理
5. **代码生成** - 多语言支持

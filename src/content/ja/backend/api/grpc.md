---
title: gRPC
description: gRPC プロトコル、Protocol Buffers とサービス間通信
order: 3
tags:
  - api
  - grpc
  - protobuf
  - rpc
---

# gRPC

## gRPC 概要

gRPC は Google が開発した高性能 RPC フレームワークで、Protocol Buffers をインターフェース定義言語とメッセージシリアライズ形式として使用します。

```
gRPC の特徴
├── 高性能 - バイナリシリアライズ、HTTP/2
├── 強い型付け - Protocol Buffers 定義
├── 多言語対応 - 複数プログラミング言語サポート
├── ストリーミング - 双方向ストリームサポート
└── コード生成 - クライアント/サーバーコード自動生成
```

## Protocol Buffers

### 基本構文

```protobuf
// user.proto
syntax = "proto3";

package user.v1;

option go_package = "github.com/example/user/v1";

// メッセージ定義
message User {
  string id = 1;
  string name = 2;
  string email = 3;
  UserRole role = 4;
  repeated string tags = 5;
  optional string bio = 6;
  google.protobuf.Timestamp created_at = 7;
}

// 列挙型
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;
  USER_ROLE_ADMIN = 1;
  USER_ROLE_USER = 2;
  USER_ROLE_GUEST = 3;
}

// ネストメッセージ
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

### スカラー型

```protobuf
// 数値型
int32, int64       // 符号付き整数
uint32, uint64     // 符号なし整数
sint32, sint64     // 符号付き (ZigZag エンコード)
fixed32, fixed64   // 固定長符号なし
sfixed32, sfixed64 // 固定長符号付き
float, double      // 浮動小数点

// その他の型
bool               // ブール値
string             // UTF-8 文字列
bytes              // 任意バイト列
```

### サービス定義

```protobuf
// サービス定義
service UserService {
  // 単項 RPC
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);

  // サーバーストリーム
  rpc ListUsers(ListUsersRequest) returns (stream User);

  // クライアントストリーム
  rpc CreateUsers(stream CreateUserRequest) returns (CreateUsersResponse);

  // 双方向ストリーム
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

// リクエストメッセージ
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

## サービス実装

### Go サーバー

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

// サーバーストリーム
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

### Go クライアント

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

    // 単項呼び出し
    resp, err := client.GetUser(context.Background(), &pb.GetUserRequest{
        Id: "123",
    })
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("User: %v", resp.User)

    // サーバーストリーム
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

## ストリーミング

### 4 つのモード

```
1. 単項 RPC
   Client -> Server: Request
   Server -> Client: Response

2. サーバーストリーム
   Client -> Server: Request
   Server -> Client: Response1, Response2, ...

3. クライアントストリーム
   Client -> Server: Request1, Request2, ...
   Server -> Client: Response

4. 双方向ストリーム
   Client <-> Server: 双方向メッセージストリーム
```

### 双方向ストリーム例

```go
// サーバー
func (s *chatServer) Chat(stream pb.ChatService_ChatServer) error {
    for {
        msg, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        // メッセージ処理
        response := &pb.ChatMessage{
            Content: "Echo: " + msg.Content,
        }
        if err := stream.Send(response); err != nil {
            return err
        }
    }
}

// クライアント
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

## インターセプター

```go
// 単項インターセプター
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

// ストリームインターセプター
func streamInterceptor(
    srv interface{},
    ss grpc.ServerStream,
    info *grpc.StreamServerInfo,
    handler grpc.StreamHandler,
) error {
    log.Printf("Stream started: %s", info.FullMethod)
    return handler(srv, ss)
}

// インターセプター登録
server := grpc.NewServer(
    grpc.UnaryInterceptor(loggingInterceptor),
    grpc.StreamInterceptor(streamInterceptor),
)
```

## エラーハンドリング

```go
import "google.golang.org/grpc/codes"
import "google.golang.org/grpc/status"

// エラー返却
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

// エラー処理
resp, err := client.GetUser(ctx, req)
if err != nil {
    st, ok := status.FromError(err)
    if ok {
        switch st.Code() {
        case codes.NotFound:
            // NotFound 処理
        case codes.InvalidArgument:
            // パラメータエラー処理
        }
    }
}
```

## まとめ

gRPC のポイント：

1. **Protocol Buffers** - 強い型付けインターフェース定義
2. **高性能** - バイナリシリアライズ + HTTP/2
3. **ストリーミング** - 4 つの RPC モード
4. **インターセプター** - 横断的関心事の処理
5. **コード生成** - 多言語サポート

---
title: TypeScript 言語基礎
description: TypeScript 型システム、高度な型とフロントエンド開発のベストプラクティス
order: 1
tags:
  - typescript
  - web
  - frontend
  - static-typing
---

# TypeScript 言語基礎

## TypeScript 概要

TypeScript は JavaScript のスーパーセットで、静的型システムとモダンな ECMAScript 機能を追加し、より良い開発体験とコードの保守性を提供します。

```
TypeScript の特徴
├── 静的型付け - コンパイル時の型チェック
├── 型推論 - スマートな型推定
├── 段階的導入 - JavaScript との完全互換
├── モダン構文 - 最新 ECMAScript 機能をサポート
└── ツールサポート - 強力な IDE サポート
```

## 基本型

### プリミティブ型

```typescript
// 基本型
let name: string = "TypeScript";
let age: number = 10;
let isTyped: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 型推論
let inferred = "Hello";  // 自動的に string と推論

// リテラル型
let direction: "left" | "right" | "up" | "down" = "left";
let statusCode: 200 | 404 | 500 = 200;

// any と unknown
let anyValue: any = "anything";
let unknownValue: unknown = "check first";

// unknown は型チェックが必要
if (typeof unknownValue === "string") {
    console.log(unknownValue.toUpperCase());
}

// never - 決して返らない
function throwError(msg: string): never {
    throw new Error(msg);
}
```

### 配列とタプル

```typescript
// 配列
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// 読み取り専用配列
let readonlyArr: readonly number[] = [1, 2, 3];
let readonlyArr2: ReadonlyArray<number> = [1, 2, 3];

// タプル - 固定長と型
let tuple: [string, number] = ["age", 30];
let tuple2: [string, number, boolean] = ["name", 1, true];

// ラベル付きタプル (TS 4.0+)
type Point = [x: number, y: number, z?: number];
let point: Point = [10, 20];

// 可変長タプル
type StringNumberBooleans = [string, number, ...boolean[]];
```

### オブジェクト型

```typescript
// オブジェクト型
let user: { name: string; age: number } = {
    name: "Alice",
    age: 30
};

// オプショナルプロパティ
let config: { host: string; port?: number } = {
    host: "localhost"
};

// 読み取り専用プロパティ
let point: { readonly x: number; readonly y: number } = {
    x: 10,
    y: 20
};

// インデックスシグネチャ
let dict: { [key: string]: number } = {
    apple: 1,
    banana: 2
};

// Record 型
let record: Record<string, number> = {
    a: 1,
    b: 2
};
```

## インターフェースと型エイリアス

### インターフェース

```typescript
// インターフェース定義
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;  // オプショナル
    readonly createdAt: Date;  // 読み取り専用
}

// インターフェース拡張
interface Admin extends User {
    role: "admin";
    permissions: string[];
}

// 複数インターフェース継承
interface SuperAdmin extends User, Admin {
    superPower: boolean;
}

// 関数インターフェース
interface SearchFunc {
    (query: string, limit?: number): Promise<Result[]>;
}

// 呼び出し可能インターフェース
interface CallableUser {
    (): void;
    name: string;
}

// インデックスインターフェース
interface StringArray {
    [index: number]: string;
}
```

### 型エイリアス

```typescript
// 型エイリアス
type ID = string | number;
type Point = { x: number; y: number };
type Callback = (data: string) => void;

// ユニオン型
type Status = "pending" | "success" | "error";
type Result = string | number | null;

// 交差型
type Employee = User & { department: string };

// 条件型
type NonNullable<T> = T extends null | undefined ? never : T;

// マップ型
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

## 関数型

### 関数宣言

```typescript
// 関数型宣言
function add(a: number, b: number): number {
    return a + b;
}

// アロー関数
const multiply = (a: number, b: number): number => a * b;

// オプショナル引数
function greet(name: string, greeting?: string): string {
    return `${greeting ?? "Hello"}, ${name}!`;
}

// デフォルト引数
function createUser(name: string, role: string = "user"): User {
    return { name, role };
}

// 残余引数
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}

// 関数オーバーロード
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
    return String(value);
}
```

### ジェネリック関数

```typescript
// ジェネリック関数
function identity<T>(value: T): T {
    return value;
}

// 複数ジェネリック引数
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

// ジェネリック制約
function getLength<T extends { length: number }>(value: T): number {
    return value.length;
}

// keyof 制約
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// デフォルトジェネリック型
function createArray<T = string>(length: number, value: T): T[] {
    return Array(length).fill(value);
}
```

## クラス

```typescript
// クラス定義
class Person {
    // プロパティ
    public name: string;
    private age: number;
    protected email: string;
    readonly id: number;

    // 静的プロパティ
    static count = 0;

    // コンストラクタ
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
        this.email = "";
        this.id = ++Person.count;
    }

    // メソッド
    greet(): string {
        return `Hello, I'm ${this.name}`;
    }

    // getter/setter
    get fullInfo(): string {
        return `${this.name} (${this.age})`;
    }

    set userAge(age: number) {
        if (age > 0) this.age = age;
    }
}

// 継承
class Employee extends Person {
    department: string;

    constructor(name: string, age: number, department: string) {
        super(name, age);
        this.department = department;
    }

    override greet(): string {
        return `${super.greet()}, from ${this.department}`;
    }
}

// 抽象クラス
abstract class Shape {
    abstract area(): number;
    abstract perimeter(): number;

    describe(): string {
        return `Area: ${this.area()}`;
    }
}

// インターフェース実装
interface Printable {
    print(): void;
}

class Document implements Printable {
    print(): void {
        console.log("Printing...");
    }
}
```

## 高度な型

### ユーティリティ型

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Partial - すべてオプショナル
type PartialUser = Partial<User>;

// Required - すべて必須
type RequiredUser = Required<User>;

// Readonly - すべて読み取り専用
type ReadonlyUser = Readonly<User>;

// Pick - 一部を選択
type UserBasic = Pick<User, "id" | "name">;

// Omit - 一部を除外
type UserWithoutEmail = Omit<User, "email">;

// Record - オブジェクト型構築
type UserRecord = Record<string, User>;

// Exclude - ユニオンから除外
type Status = "pending" | "success" | "error";
type SuccessStatus = Exclude<Status, "error">;

// Extract - ユニオンから抽出
type ErrorStatus = Extract<Status, "error" | "pending">;

// ReturnType - 関数の戻り値型
function getUser() { return { id: 1, name: "Alice" }; }
type UserType = ReturnType<typeof getUser>;

// Parameters - 関数の引数型
type GetUserParams = Parameters<typeof getUser>;
```

### 条件型

```typescript
// 基本条件型
type IsString<T> = T extends string ? true : false;

// infer キーワード
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type ArrayElement<T> = T extends (infer E)[] ? E : never;

// 分散条件型
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;  // string[] | number[]

// テンプレートリテラル型
type EventName = `on${Capitalize<"click" | "focus" | "blur">}`;
// "onClick" | "onFocus" | "onBlur"
```

### 型ガード

```typescript
// typeof ガード
function process(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value.toFixed(2);
}

// instanceof ガード
function handleError(error: Error | string) {
    if (error instanceof Error) {
        return error.message;
    }
    return error;
}

// in ガード
interface Cat { meow(): void; }
interface Dog { bark(): void; }

function speak(animal: Cat | Dog) {
    if ("meow" in animal) {
        animal.meow();
    } else {
        animal.bark();
    }
}

// カスタム型ガード
function isString(value: unknown): value is string {
    return typeof value === "string";
}

// アサーション関数
function assertNonNull<T>(value: T): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error("Value is null or undefined");
    }
}
```

## モジュールと名前空間

```typescript
// エクスポート
export interface User { name: string; }
export type ID = string | number;
export const VERSION = "1.0.0";
export default class App { }

// インポート
import App, { User, ID, VERSION } from "./app";
import type { User } from "./app";  // 型のみインポート
import * as Utils from "./utils";

// 動的インポート
const module = await import("./module");

// 型宣言ファイル (.d.ts)
declare module "some-library" {
    export function doSomething(): void;
}

// グローバル宣言
declare global {
    interface Window {
        myGlobal: string;
    }
}
```

## デコレータ

```typescript
// クラスデコレータ
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class Greeter { }

// メソッドデコレータ
function log(target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args: any[]) {
        console.log(`Calling ${key} with`, args);
        return original.apply(this, args);
    };
    return descriptor;
}

class Calculator {
    @log
    add(a: number, b: number) {
        return a + b;
    }
}

// プロパティデコレータ
function readonly(target: any, key: string) {
    Object.defineProperty(target, key, {
        writable: false
    });
}
```

## 設定とツール

### tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "declaration": true,
        "outDir": "./dist",
        "rootDir": "./src",
        "baseUrl": "./",
        "paths": {
            "@/*": ["src/*"]
        }
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
}
```

## まとめ

TypeScript のポイント：

1. **型安全** - コンパイル時エラー検出
2. **型推論** - スマートな推定で冗長性削減
3. **高度な型** - ジェネリクス、条件型、マップ型
4. **段階的** - JavaScript プロジェクトを段階的に移行
5. **豊富なエコシステム** - @types 型定義ライブラリ

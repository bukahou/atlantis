---
title: TypeScript 语言基础
description: TypeScript 类型系统、高级类型与前端开发最佳实践
order: 1
tags:
  - typescript
  - web
  - frontend
  - static-typing
---

# TypeScript 语言基础

## TypeScript 概述

TypeScript 是 JavaScript 的超集，添加了静态类型系统和现代 ECMAScript 特性，提供更好的开发体验和代码可维护性。

```
TypeScript 特点
├── 静态类型 - 编译时类型检查
├── 类型推断 - 智能类型推导
├── 渐进式采用 - 与 JavaScript 无缝兼容
├── 现代语法 - 支持最新 ECMAScript 特性
└── 工具支持 - 强大的 IDE 支持
```

## 基础类型

### 原始类型

```typescript
// 基本类型
let name: string = "TypeScript";
let age: number = 10;
let isTyped: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 类型推断
let inferred = "Hello";  // 自动推断为 string

// 字面量类型
let direction: "left" | "right" | "up" | "down" = "left";
let statusCode: 200 | 404 | 500 = 200;

// any 与 unknown
let anyValue: any = "anything";
let unknownValue: unknown = "check first";

// unknown 需要类型检查
if (typeof unknownValue === "string") {
    console.log(unknownValue.toUpperCase());
}

// never - 永不返回
function throwError(msg: string): never {
    throw new Error(msg);
}
```

### 数组与元组

```typescript
// 数组
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// 只读数组
let readonlyArr: readonly number[] = [1, 2, 3];
let readonlyArr2: ReadonlyArray<number> = [1, 2, 3];

// 元组 - 固定长度和类型
let tuple: [string, number] = ["age", 30];
let tuple2: [string, number, boolean] = ["name", 1, true];

// 具名元组 (TS 4.0+)
type Point = [x: number, y: number, z?: number];
let point: Point = [10, 20];

// 可变长度元组
type StringNumberBooleans = [string, number, ...boolean[]];
```

### 对象类型

```typescript
// 对象类型
let user: { name: string; age: number } = {
    name: "Alice",
    age: 30
};

// 可选属性
let config: { host: string; port?: number } = {
    host: "localhost"
};

// 只读属性
let point: { readonly x: number; readonly y: number } = {
    x: 10,
    y: 20
};

// 索引签名
let dict: { [key: string]: number } = {
    apple: 1,
    banana: 2
};

// Record 类型
let record: Record<string, number> = {
    a: 1,
    b: 2
};
```

## 接口与类型别名

### 接口

```typescript
// 接口定义
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;  // 可选
    readonly createdAt: Date;  // 只读
}

// 接口扩展
interface Admin extends User {
    role: "admin";
    permissions: string[];
}

// 多接口继承
interface SuperAdmin extends User, Admin {
    superPower: boolean;
}

// 函数接口
interface SearchFunc {
    (query: string, limit?: number): Promise<Result[]>;
}

// 可调用接口
interface CallableUser {
    (): void;
    name: string;
}

// 索引接口
interface StringArray {
    [index: number]: string;
}
```

### 类型别名

```typescript
// 类型别名
type ID = string | number;
type Point = { x: number; y: number };
type Callback = (data: string) => void;

// 联合类型
type Status = "pending" | "success" | "error";
type Result = string | number | null;

// 交叉类型
type Employee = User & { department: string };

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 映射类型
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

## 函数类型

### 函数声明

```typescript
// 函数类型声明
function add(a: number, b: number): number {
    return a + b;
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b;

// 可选参数
function greet(name: string, greeting?: string): string {
    return `${greeting ?? "Hello"}, ${name}!`;
}

// 默认参数
function createUser(name: string, role: string = "user"): User {
    return { name, role };
}

// 剩余参数
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}

// 函数重载
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
    return String(value);
}
```

### 泛型函数

```typescript
// 泛型函数
function identity<T>(value: T): T {
    return value;
}

// 多泛型参数
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

// 泛型约束
function getLength<T extends { length: number }>(value: T): number {
    return value.length;
}

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// 默认泛型类型
function createArray<T = string>(length: number, value: T): T[] {
    return Array(length).fill(value);
}
```

## 类

```typescript
// 类定义
class Person {
    // 属性
    public name: string;
    private age: number;
    protected email: string;
    readonly id: number;

    // 静态属性
    static count = 0;

    // 构造函数
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
        this.email = "";
        this.id = ++Person.count;
    }

    // 方法
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

// 继承
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

// 抽象类
abstract class Shape {
    abstract area(): number;
    abstract perimeter(): number;

    describe(): string {
        return `Area: ${this.area()}`;
    }
}

// 实现接口
interface Printable {
    print(): void;
}

class Document implements Printable {
    print(): void {
        console.log("Printing...");
    }
}
```

## 高级类型

### 实用类型

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Partial - 所有属性可选
type PartialUser = Partial<User>;

// Required - 所有属性必选
type RequiredUser = Required<User>;

// Readonly - 所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick - 选择部分属性
type UserBasic = Pick<User, "id" | "name">;

// Omit - 排除部分属性
type UserWithoutEmail = Omit<User, "email">;

// Record - 构造对象类型
type UserRecord = Record<string, User>;

// Exclude - 排除联合类型成员
type Status = "pending" | "success" | "error";
type SuccessStatus = Exclude<Status, "error">;

// Extract - 提取联合类型成员
type ErrorStatus = Extract<Status, "error" | "pending">;

// ReturnType - 获取函数返回类型
function getUser() { return { id: 1, name: "Alice" }; }
type UserType = ReturnType<typeof getUser>;

// Parameters - 获取函数参数类型
type GetUserParams = Parameters<typeof getUser>;
```

### 条件类型

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;

// infer 关键字
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type ArrayElement<T> = T extends (infer E)[] ? E : never;

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;  // string[] | number[]

// 模板字面量类型
type EventName = `on${Capitalize<"click" | "focus" | "blur">}`;
// "onClick" | "onFocus" | "onBlur"
```

### 类型守卫

```typescript
// typeof 守卫
function process(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value.toFixed(2);
}

// instanceof 守卫
function handleError(error: Error | string) {
    if (error instanceof Error) {
        return error.message;
    }
    return error;
}

// in 守卫
interface Cat { meow(): void; }
interface Dog { bark(): void; }

function speak(animal: Cat | Dog) {
    if ("meow" in animal) {
        animal.meow();
    } else {
        animal.bark();
    }
}

// 自定义类型守卫
function isString(value: unknown): value is string {
    return typeof value === "string";
}

// 断言函数
function assertNonNull<T>(value: T): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error("Value is null or undefined");
    }
}
```

## 模块与命名空间

```typescript
// 导出
export interface User { name: string; }
export type ID = string | number;
export const VERSION = "1.0.0";
export default class App { }

// 导入
import App, { User, ID, VERSION } from "./app";
import type { User } from "./app";  // 仅类型导入
import * as Utils from "./utils";

// 动态导入
const module = await import("./module");

// 类型声明文件 (.d.ts)
declare module "some-library" {
    export function doSomething(): void;
}

// 全局声明
declare global {
    interface Window {
        myGlobal: string;
    }
}
```

## 装饰器

```typescript
// 类装饰器
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class Greeter { }

// 方法装饰器
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

// 属性装饰器
function readonly(target: any, key: string) {
    Object.defineProperty(target, key, {
        writable: false
    });
}
```

## 配置与工具

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

## 总结

TypeScript 核心要点：

1. **类型安全** - 编译时捕获错误
2. **类型推断** - 智能推导减少冗余
3. **高级类型** - 泛型、条件类型、映射类型
4. **渐进式** - 可逐步迁移 JavaScript 项目
5. **生态丰富** - @types 类型定义库

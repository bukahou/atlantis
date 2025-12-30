---
title: JavaScript 语言基础
description: JavaScript 核心语法、ES6+ 特性与异步编程
order: 2
tags:
  - javascript
  - web
  - frontend
  - dynamic
---

# JavaScript 语言基础

## JavaScript 概述

JavaScript 是 Web 开发的核心语言，支持面向对象、函数式和事件驱动编程范式，运行于浏览器和 Node.js 环境。

```
JavaScript 特点
├── 动态类型 - 运行时类型检查
├── 原型继承 - 基于原型的对象系统
├── 事件驱动 - 异步非阻塞模型
├── 跨平台 - 浏览器 + Node.js
└── 生态丰富 - npm 最大的包生态
```

## 基础语法

### 变量与数据类型

```javascript
// 变量声明
var oldStyle = "避免使用";
let mutable = "可变";
const immutable = "不可变引用";

// 原始类型
const str = "Hello";           // String
const num = 42;                // Number
const bigInt = 9007199254740991n;  // BigInt
const bool = true;             // Boolean
const undef = undefined;       // Undefined
const nul = null;              // Null
const sym = Symbol("id");      // Symbol

// typeof 检查
typeof str;      // "string"
typeof num;      // "number"
typeof bool;     // "boolean"
typeof undef;    // "undefined"
typeof nul;      // "object" (历史遗留问题)
typeof sym;      // "symbol"

// 类型转换
String(42);      // "42"
Number("42");    // 42
Boolean(0);      // false
parseInt("42px"); // 42
parseFloat("3.14"); // 3.14
```

### 字符串

```javascript
// 模板字符串
const name = "World";
const greeting = `Hello, ${name}!`;
const multiline = `
  Line 1
  Line 2
`;

// 字符串方法
str.length;
str.charAt(0);
str.includes("ll");
str.startsWith("He");
str.endsWith("lo");
str.indexOf("l");
str.slice(0, 5);
str.split(",");
str.trim();
str.padStart(10, "0");
str.repeat(3);
str.replace("old", "new");
str.replaceAll("a", "b");
str.toLowerCase();
str.toUpperCase();
```

### 数组

```javascript
// 创建数组
const arr = [1, 2, 3, 4, 5];
const arr2 = Array.from("hello");
const arr3 = Array.of(1, 2, 3);
const arr4 = new Array(5).fill(0);

// 数组方法
arr.push(6);           // 末尾添加
arr.pop();             // 末尾删除
arr.unshift(0);        // 开头添加
arr.shift();           // 开头删除
arr.splice(1, 2);      // 删除/插入
arr.slice(1, 3);       // 切片
arr.concat([6, 7]);    // 合并
arr.includes(3);       // 包含
arr.indexOf(3);        // 索引
arr.find(x => x > 2);  // 查找
arr.findIndex(x => x > 2);

// 迭代方法
arr.forEach(x => console.log(x));
arr.map(x => x * 2);
arr.filter(x => x > 2);
arr.reduce((acc, x) => acc + x, 0);
arr.some(x => x > 3);
arr.every(x => x > 0);
arr.flat();
arr.flatMap(x => [x, x * 2]);

// 排序
arr.sort((a, b) => a - b);
arr.reverse();

// 扩展运算符
const newArr = [...arr, 6, 7];
const [first, ...rest] = arr;
```

### 对象

```javascript
// 对象创建
const obj = {
    name: "Alice",
    age: 30,
    greet() {
        return `Hello, ${this.name}`;
    }
};

// 属性访问
obj.name;
obj["name"];
obj?.address?.city;  // 可选链

// 属性操作
obj.email = "alice@example.com";
delete obj.age;
"name" in obj;
Object.keys(obj);
Object.values(obj);
Object.entries(obj);

// 对象方法
Object.assign({}, obj, { age: 31 });
Object.freeze(obj);     // 不可修改
Object.seal(obj);       // 不可添加删除
Object.getOwnPropertyNames(obj);

// 扩展运算符
const newObj = { ...obj, age: 31 };
const { name, ...rest } = obj;

// 计算属性名
const key = "dynamicKey";
const dynamic = { [key]: "value" };

// 简写
const x = 1, y = 2;
const point = { x, y };  // { x: 1, y: 2 }
```

## 函数

### 函数声明

```javascript
// 函数声明
function add(a, b) {
    return a + b;
}

// 函数表达式
const multiply = function(a, b) {
    return a * b;
};

// 箭头函数
const subtract = (a, b) => a - b;
const square = x => x * x;
const greet = () => "Hello";

// 默认参数
function greet(name = "World") {
    return `Hello, ${name}!`;
}

// 剩余参数
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

// 解构参数
function createUser({ name, age, role = "user" }) {
    return { name, age, role };
}
```

### 高阶函数

```javascript
// 函数作为参数
function map(arr, fn) {
    return arr.map(fn);
}

// 函数作为返回值
function multiplier(factor) {
    return x => x * factor;
}

const double = multiplier(2);
double(5);  // 10

// 闭包
function counter() {
    let count = 0;
    return {
        increment: () => ++count,
        decrement: () => --count,
        get: () => count
    };
}

// 柯里化
const curry = fn => a => b => fn(a, b);
const curriedAdd = curry((a, b) => a + b);
curriedAdd(1)(2);  // 3

// 组合
const compose = (...fns) => x =>
    fns.reduceRight((acc, fn) => fn(acc), x);
```

## 类与原型

### ES6 类

```javascript
class Person {
    // 私有字段
    #secret = "hidden";

    // 静态属性
    static count = 0;

    constructor(name, age) {
        this.name = name;
        this.age = age;
        Person.count++;
    }

    // 方法
    greet() {
        return `Hello, I'm ${this.name}`;
    }

    // getter/setter
    get info() {
        return `${this.name}, ${this.age}`;
    }

    set info(value) {
        [this.name, this.age] = value.split(",");
    }

    // 静态方法
    static create(name, age) {
        return new Person(name, age);
    }
}

// 继承
class Employee extends Person {
    constructor(name, age, department) {
        super(name, age);
        this.department = department;
    }

    greet() {
        return `${super.greet()}, from ${this.department}`;
    }
}
```

### 原型

```javascript
// 原型链
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    console.log(`${this.name} makes a sound`);
};

// 原型继承
function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 原型方法
Object.getPrototypeOf(obj);
Object.setPrototypeOf(obj, proto);
obj.hasOwnProperty("name");
```

## 异步编程

### Promise

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Success");
        // reject(new Error("Failed"));
    }, 1000);
});

// Promise 链
promise
    .then(result => {
        console.log(result);
        return "Next";
    })
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Done"));

// Promise 静态方法
Promise.all([p1, p2, p3]);        // 全部成功
Promise.allSettled([p1, p2]);     // 全部完成
Promise.race([p1, p2]);           // 第一个完成
Promise.any([p1, p2]);            // 第一个成功

// 创建已解决的 Promise
Promise.resolve("value");
Promise.reject(new Error("error"));
```

### async/await

```javascript
// async 函数
async function fetchData() {
    try {
        const response = await fetch("/api/data");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// 并行执行
async function parallel() {
    const [result1, result2] = await Promise.all([
        fetchData1(),
        fetchData2()
    ]);
    return { result1, result2 };
}

// 顺序执行
async function sequential() {
    const result1 = await fetchData1();
    const result2 = await fetchData2(result1);
    return result2;
}

// 错误处理
async function withErrorHandling() {
    const result = await fetchData().catch(e => null);
    return result ?? "default";
}
```

### 事件循环

```javascript
// 宏任务 vs 微任务
console.log("1");

setTimeout(() => console.log("2"), 0);  // 宏任务

Promise.resolve().then(() => console.log("3"));  // 微任务

console.log("4");

// 输出: 1, 4, 3, 2

// queueMicrotask
queueMicrotask(() => {
    console.log("Microtask");
});
```

## 模块系统

### ES Modules

```javascript
// 导出
export const VERSION = "1.0.0";
export function helper() { }
export class Utils { }
export default class App { }

// 命名导出
export { a, b, c };
export { original as renamed };

// 导入
import App from "./app.js";
import { helper, Utils } from "./utils.js";
import * as Utils from "./utils.js";
import { original as renamed } from "./module.js";

// 动态导入
const module = await import("./module.js");

// 重新导出
export { default } from "./module.js";
export * from "./utils.js";
```

## ES6+ 新特性

### 解构赋值

```javascript
// 数组解构
const [a, b, c] = [1, 2, 3];
const [first, ...rest] = [1, 2, 3, 4];
const [x = 0, y = 0] = [1];

// 对象解构
const { name, age } = user;
const { name: userName, age: userAge } = user;
const { address: { city } = {} } = user;

// 函数参数解构
function process({ name, options = {} }) {
    console.log(name, options);
}
```

### 迭代器与生成器

```javascript
// 迭代器
const iterable = {
    [Symbol.iterator]() {
        let i = 0;
        return {
            next() {
                return i < 3
                    ? { value: i++, done: false }
                    : { done: true };
            }
        };
    }
};

// 生成器
function* generator() {
    yield 1;
    yield 2;
    yield 3;
}

// 异步生成器
async function* asyncGenerator() {
    yield await fetchData1();
    yield await fetchData2();
}

for await (const data of asyncGenerator()) {
    console.log(data);
}
```

### 代理与反射

```javascript
// Proxy
const handler = {
    get(target, prop) {
        console.log(`Getting ${prop}`);
        return target[prop];
    },
    set(target, prop, value) {
        console.log(`Setting ${prop} = ${value}`);
        target[prop] = value;
        return true;
    }
};

const proxy = new Proxy({}, handler);

// Reflect
Reflect.get(obj, "name");
Reflect.set(obj, "name", "Alice");
Reflect.has(obj, "name");
Reflect.deleteProperty(obj, "name");
```

### 其他特性

```javascript
// 可选链
obj?.property;
obj?.[expression];
obj?.method?.();

// 空值合并
const value = null ?? "default";

// 逻辑赋值
x ||= y;  // x = x || y
x &&= y;  // x = x && y
x ??= y;  // x = x ?? y

// 数组 at()
arr.at(-1);  // 最后一个元素

// Object.fromEntries
Object.fromEntries([["a", 1], ["b", 2]]);

// 数字分隔符
const billion = 1_000_000_000;
```

## 总结

JavaScript 核心要点：

1. **动态类型** - 灵活但需注意类型转换
2. **原型继承** - 独特的对象系统
3. **异步编程** - Promise + async/await
4. **函数式** - 高阶函数、闭包
5. **持续进化** - 每年新特性 (ES6+)

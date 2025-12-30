---
title: JavaScript 言語基礎
description: JavaScript コア構文、ES6+ 機能と非同期プログラミング
order: 2
tags:
  - javascript
  - web
  - frontend
  - dynamic
---

# JavaScript 言語基礎

## JavaScript 概要

JavaScript は Web 開発のコア言語で、オブジェクト指向、関数型、イベント駆動プログラミングパラダイムをサポートし、ブラウザと Node.js 環境で動作します。

```
JavaScript の特徴
├── 動的型付け - 実行時の型チェック
├── プロトタイプ継承 - プロトタイプベースのオブジェクトシステム
├── イベント駆動 - 非同期ノンブロッキングモデル
├── クロスプラットフォーム - ブラウザ + Node.js
└── 豊富なエコシステム - npm 最大のパッケージエコシステム
```

## 基本構文

### 変数とデータ型

```javascript
// 変数宣言
var oldStyle = "使用を避ける";
let mutable = "可変";
const immutable = "不変の参照";

// プリミティブ型
const str = "Hello";           // String
const num = 42;                // Number
const bigInt = 9007199254740991n;  // BigInt
const bool = true;             // Boolean
const undef = undefined;       // Undefined
const nul = null;              // Null
const sym = Symbol("id");      // Symbol

// typeof チェック
typeof str;      // "string"
typeof num;      // "number"
typeof bool;     // "boolean"
typeof undef;    // "undefined"
typeof nul;      // "object" (歴史的な問題)
typeof sym;      // "symbol"

// 型変換
String(42);      // "42"
Number("42");    // 42
Boolean(0);      // false
parseInt("42px"); // 42
parseFloat("3.14"); // 3.14
```

### 文字列

```javascript
// テンプレート文字列
const name = "World";
const greeting = `Hello, ${name}!`;
const multiline = `
  Line 1
  Line 2
`;

// 文字列メソッド
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

### 配列

```javascript
// 配列の作成
const arr = [1, 2, 3, 4, 5];
const arr2 = Array.from("hello");
const arr3 = Array.of(1, 2, 3);
const arr4 = new Array(5).fill(0);

// 配列メソッド
arr.push(6);           // 末尾に追加
arr.pop();             // 末尾から削除
arr.unshift(0);        // 先頭に追加
arr.shift();           // 先頭から削除
arr.splice(1, 2);      // 削除/挿入
arr.slice(1, 3);       // スライス
arr.concat([6, 7]);    // 結合
arr.includes(3);       // 含む
arr.indexOf(3);        // インデックス
arr.find(x => x > 2);  // 検索
arr.findIndex(x => x > 2);

// 反復メソッド
arr.forEach(x => console.log(x));
arr.map(x => x * 2);
arr.filter(x => x > 2);
arr.reduce((acc, x) => acc + x, 0);
arr.some(x => x > 3);
arr.every(x => x > 0);
arr.flat();
arr.flatMap(x => [x, x * 2]);

// ソート
arr.sort((a, b) => a - b);
arr.reverse();

// スプレッド演算子
const newArr = [...arr, 6, 7];
const [first, ...rest] = arr;
```

### オブジェクト

```javascript
// オブジェクト作成
const obj = {
    name: "Alice",
    age: 30,
    greet() {
        return `Hello, ${this.name}`;
    }
};

// プロパティアクセス
obj.name;
obj["name"];
obj?.address?.city;  // オプショナルチェーン

// プロパティ操作
obj.email = "alice@example.com";
delete obj.age;
"name" in obj;
Object.keys(obj);
Object.values(obj);
Object.entries(obj);

// オブジェクトメソッド
Object.assign({}, obj, { age: 31 });
Object.freeze(obj);     // 変更不可
Object.seal(obj);       // 追加削除不可
Object.getOwnPropertyNames(obj);

// スプレッド演算子
const newObj = { ...obj, age: 31 };
const { name, ...rest } = obj;

// 計算プロパティ名
const key = "dynamicKey";
const dynamic = { [key]: "value" };

// 省略記法
const x = 1, y = 2;
const point = { x, y };  // { x: 1, y: 2 }
```

## 関数

### 関数宣言

```javascript
// 関数宣言
function add(a, b) {
    return a + b;
}

// 関数式
const multiply = function(a, b) {
    return a * b;
};

// アロー関数
const subtract = (a, b) => a - b;
const square = x => x * x;
const greet = () => "Hello";

// デフォルト引数
function greet(name = "World") {
    return `Hello, ${name}!`;
}

// 残余引数
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

// 分割代入引数
function createUser({ name, age, role = "user" }) {
    return { name, age, role };
}
```

### 高階関数

```javascript
// 関数を引数として
function map(arr, fn) {
    return arr.map(fn);
}

// 関数を戻り値として
function multiplier(factor) {
    return x => x * factor;
}

const double = multiplier(2);
double(5);  // 10

// クロージャ
function counter() {
    let count = 0;
    return {
        increment: () => ++count,
        decrement: () => --count,
        get: () => count
    };
}

// カリー化
const curry = fn => a => b => fn(a, b);
const curriedAdd = curry((a, b) => a + b);
curriedAdd(1)(2);  // 3

// 合成
const compose = (...fns) => x =>
    fns.reduceRight((acc, fn) => fn(acc), x);
```

## クラスとプロトタイプ

### ES6 クラス

```javascript
class Person {
    // プライベートフィールド
    #secret = "hidden";

    // 静的プロパティ
    static count = 0;

    constructor(name, age) {
        this.name = name;
        this.age = age;
        Person.count++;
    }

    // メソッド
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

    // 静的メソッド
    static create(name, age) {
        return new Person(name, age);
    }
}

// 継承
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

### プロトタイプ

```javascript
// プロトタイプチェーン
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    console.log(`${this.name} makes a sound`);
};

// プロトタイプ継承
function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// プロトタイプメソッド
Object.getPrototypeOf(obj);
Object.setPrototypeOf(obj, proto);
obj.hasOwnProperty("name");
```

## 非同期プログラミング

### Promise

```javascript
// Promise の作成
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Success");
        // reject(new Error("Failed"));
    }, 1000);
});

// Promise チェーン
promise
    .then(result => {
        console.log(result);
        return "Next";
    })
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Done"));

// Promise 静的メソッド
Promise.all([p1, p2, p3]);        // すべて成功
Promise.allSettled([p1, p2]);     // すべて完了
Promise.race([p1, p2]);           // 最初に完了
Promise.any([p1, p2]);            // 最初に成功

// 解決済み Promise の作成
Promise.resolve("value");
Promise.reject(new Error("error"));
```

### async/await

```javascript
// async 関数
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

// 並列実行
async function parallel() {
    const [result1, result2] = await Promise.all([
        fetchData1(),
        fetchData2()
    ]);
    return { result1, result2 };
}

// 順次実行
async function sequential() {
    const result1 = await fetchData1();
    const result2 = await fetchData2(result1);
    return result2;
}

// エラー処理
async function withErrorHandling() {
    const result = await fetchData().catch(e => null);
    return result ?? "default";
}
```

### イベントループ

```javascript
// マクロタスク vs マイクロタスク
console.log("1");

setTimeout(() => console.log("2"), 0);  // マクロタスク

Promise.resolve().then(() => console.log("3"));  // マイクロタスク

console.log("4");

// 出力: 1, 4, 3, 2

// queueMicrotask
queueMicrotask(() => {
    console.log("Microtask");
});
```

## モジュールシステム

### ES Modules

```javascript
// エクスポート
export const VERSION = "1.0.0";
export function helper() { }
export class Utils { }
export default class App { }

// 名前付きエクスポート
export { a, b, c };
export { original as renamed };

// インポート
import App from "./app.js";
import { helper, Utils } from "./utils.js";
import * as Utils from "./utils.js";
import { original as renamed } from "./module.js";

// 動的インポート
const module = await import("./module.js");

// 再エクスポート
export { default } from "./module.js";
export * from "./utils.js";
```

## ES6+ 新機能

### 分割代入

```javascript
// 配列の分割代入
const [a, b, c] = [1, 2, 3];
const [first, ...rest] = [1, 2, 3, 4];
const [x = 0, y = 0] = [1];

// オブジェクトの分割代入
const { name, age } = user;
const { name: userName, age: userAge } = user;
const { address: { city } = {} } = user;

// 関数引数の分割代入
function process({ name, options = {} }) {
    console.log(name, options);
}
```

### イテレータとジェネレータ

```javascript
// イテレータ
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

// ジェネレータ
function* generator() {
    yield 1;
    yield 2;
    yield 3;
}

// 非同期ジェネレータ
async function* asyncGenerator() {
    yield await fetchData1();
    yield await fetchData2();
}

for await (const data of asyncGenerator()) {
    console.log(data);
}
```

### Proxy と Reflect

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

### その他の機能

```javascript
// オプショナルチェーン
obj?.property;
obj?.[expression];
obj?.method?.();

// Null 合体演算子
const value = null ?? "default";

// 論理代入
x ||= y;  // x = x || y
x &&= y;  // x = x && y
x ??= y;  // x = x ?? y

// 配列 at()
arr.at(-1);  // 最後の要素

// Object.fromEntries
Object.fromEntries([["a", 1], ["b", 2]]);

// 数値セパレータ
const billion = 1_000_000_000;
```

## まとめ

JavaScript のポイント：

1. **動的型付け** - 柔軟だが型変換に注意
2. **プロトタイプ継承** - ユニークなオブジェクトシステム
3. **非同期プログラミング** - Promise + async/await
4. **関数型** - 高階関数、クロージャ
5. **継続的進化** - 毎年新機能 (ES6+)

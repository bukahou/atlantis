---
title: データベース正規化
description: データベース正規化理論、非正規化設計とデータモデリング
order: 1
tags:
  - database
  - modeling
  - normalization
  - design
---

# データベース正規化

## 正規化概要

データベース正規化はリレーショナルデータベース設計時に冗長性を排除し、データ整合性を保証する指針です。

```
正規化レベル
├── 1NF - 原子性 (属性分割不可)
├── 2NF - 完全関数従属 (部分従属排除)
├── 3NF - 推移的従属排除
├── BCNF - 主属性従属排除
├── 4NF - 多値従属排除
└── 5NF - 結合従属排除
```

## 第一正規形 (1NF)

### 定義

すべての属性が原子的で分割不可能。

```sql
-- 1NF 違反
CREATE TABLE orders_bad (
    id INT,
    products VARCHAR(500)  -- "iPhone,MacBook,AirPods"
);

-- 1NF 準拠
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

## 第二正規形 (2NF)

### 定義

1NF を満たし、非キー属性が主キーに完全関数従属。

```sql
-- 2NF 違反 (部分従属)
-- 主キー: (student_id, course_id)
-- student_name は student_id のみに従属
CREATE TABLE enrollment_bad (
    student_id INT,
    course_id INT,
    student_name VARCHAR(100),  -- 部分従属
    grade DECIMAL(3,1),
    PRIMARY KEY (student_id, course_id)
);

-- 2NF 準拠
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE enrollments (
    student_id INT,
    course_id INT,
    grade DECIMAL(3,1),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

## 第三正規形 (3NF)

### 定義

2NF を満たし、非キー属性が主キーに推移的従属しない。

```sql
-- 3NF 違反 (推移的従属)
-- department_name は department_id に従属、id に直接従属しない
CREATE TABLE employees_bad (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department_id INT,
    department_name VARCHAR(100)  -- 推移的従属
);

-- 3NF 準拠
CREATE TABLE departments (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

## BCNF (ボイス-コッド正規形)

### 定義

3NF を満たし、すべての決定子が候補キー。

```sql
-- BCNF 違反
-- 仮定: 学生は一人の教師の授業のみ選択可能
-- 教師は一科目のみ担当
CREATE TABLE student_course_bad (
    student_id INT,
    course_id INT,
    teacher_id INT,
    PRIMARY KEY (student_id, course_id)
    -- teacher_id -> course_id だが teacher_id は候補キーでない
);

-- BCNF 準拠
CREATE TABLE teacher_courses (
    teacher_id INT PRIMARY KEY,
    course_id INT
);

CREATE TABLE student_teachers (
    student_id INT,
    teacher_id INT,
    PRIMARY KEY (student_id, teacher_id)
);
```

## 非正規化設計

### 非正規化の適用場面

```
適用シナリオ
├── 読み取り多/書き込み少 - JOIN 削減
├── レポートクエリ - 事前集計データ
├── 高性能要件 - 空間と引き換えに時間
└── データウェアハウス - スター/スノーフレークモデル
```

### 非正規化テクニック

```sql
-- 1. 冗長フィールド
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),  -- 冗長、JOIN 回避
    total_amount DECIMAL(10,2)
);

-- 2. 事前計算フィールド
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    review_count INT DEFAULT 0,  -- 事前計算
    avg_rating DECIMAL(2,1) DEFAULT 0
);

-- 3. サマリーテーブル
CREATE TABLE daily_sales (
    date DATE PRIMARY KEY,
    total_orders INT,
    total_revenue DECIMAL(12,2),
    avg_order_value DECIMAL(10,2)
);
```

## データモデリング実践

### エンティティリレーション設計

```sql
-- 一対多
CREATE TABLE categories (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 多対多
CREATE TABLE tags (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE product_tags (
    product_id INT,
    tag_id INT,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 自己参照
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);
```

### 継承パターン

```sql
-- 単一テーブル継承
CREATE TABLE vehicles (
    id INT PRIMARY KEY,
    type ENUM('car', 'motorcycle', 'truck'),
    brand VARCHAR(50),
    -- Car フィールド
    num_doors INT,
    -- Motorcycle フィールド
    engine_cc INT,
    -- Truck フィールド
    payload_capacity DECIMAL(10,2)
);

-- クラステーブル継承
CREATE TABLE vehicles (
    id INT PRIMARY KEY,
    brand VARCHAR(50)
);

CREATE TABLE cars (
    vehicle_id INT PRIMARY KEY,
    num_doors INT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE motorcycles (
    vehicle_id INT PRIMARY KEY,
    engine_cc INT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- 具象テーブル継承
CREATE TABLE cars (
    id INT PRIMARY KEY,
    brand VARCHAR(50),
    num_doors INT
);

CREATE TABLE motorcycles (
    id INT PRIMARY KEY,
    brand VARCHAR(50),
    engine_cc INT
);
```

## 設計原則

```yaml
正規化優先:
  - 高い正規形から開始
  - 性能要件に応じて適切に非正規化
  - 非正規化決定の理由を記録

命名規則:
  - テーブル名: 複数形 (users, orders)
  - 主キー: id または table_id
  - 外部キー: referenced_table_id
  - タイムスタンプ: created_at, updated_at

制約使用:
  - 主キー制約
  - 外部キー制約 (性能影響考慮)
  - ユニーク制約
  - チェック制約
```

## まとめ

データベース正規化のポイント：

1. **1NF** - 原子性、属性分割不可
2. **2NF** - 部分従属排除
3. **3NF** - 推移的従属排除
4. **非正規化** - 性能最適化、適切な冗長性
5. **実践** - 正規化と性能のバランス

---
title: 数据库范式
description: 数据库范式理论、反范式设计与数据建模
order: 1
tags:
  - database
  - modeling
  - normalization
  - design
---

# 数据库范式

## 范式概述

数据库范式是设计关系数据库时消除冗余、保证数据完整性的指导原则。

```
范式层级
├── 1NF - 原子性 (属性不可分)
├── 2NF - 完全依赖 (消除部分依赖)
├── 3NF - 消除传递依赖
├── BCNF - 消除主属性依赖
├── 4NF - 消除多值依赖
└── 5NF - 消除连接依赖
```

## 第一范式 (1NF)

### 定义

每个属性都是原子的、不可再分的。

```sql
-- 违反 1NF
CREATE TABLE orders_bad (
    id INT,
    products VARCHAR(500)  -- "iPhone,MacBook,AirPods"
);

-- 符合 1NF
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

## 第二范式 (2NF)

### 定义

满足 1NF，且非主属性完全依赖于主键。

```sql
-- 违反 2NF (部分依赖)
-- 主键: (student_id, course_id)
-- student_name 只依赖 student_id
CREATE TABLE enrollment_bad (
    student_id INT,
    course_id INT,
    student_name VARCHAR(100),  -- 部分依赖
    grade DECIMAL(3,1),
    PRIMARY KEY (student_id, course_id)
);

-- 符合 2NF
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

## 第三范式 (3NF)

### 定义

满足 2NF，且非主属性不传递依赖于主键。

```sql
-- 违反 3NF (传递依赖)
-- department_name 依赖 department_id，而非直接依赖 id
CREATE TABLE employees_bad (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department_id INT,
    department_name VARCHAR(100)  -- 传递依赖
);

-- 符合 3NF
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

## BCNF (巴斯-科德范式)

### 定义

满足 3NF，且每个决定因素都是候选键。

```sql
-- 违反 BCNF
-- 假设: 一个学生只能选一个导师的课
-- 导师只教一门课
CREATE TABLE student_course_bad (
    student_id INT,
    course_id INT,
    teacher_id INT,
    PRIMARY KEY (student_id, course_id)
    -- teacher_id -> course_id，但 teacher_id 不是候选键
);

-- 符合 BCNF
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

## 反范式设计

### 何时反范式

```
适用场景
├── 读多写少 - 减少 JOIN
├── 报表查询 - 预聚合数据
├── 高性能要求 - 空间换时间
└── 数据仓库 - 星型/雪花模型
```

### 反范式技术

```sql
-- 1. 冗余字段
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),  -- 冗余，避免 JOIN
    total_amount DECIMAL(10,2)
);

-- 2. 预计算字段
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    review_count INT DEFAULT 0,  -- 预计算
    avg_rating DECIMAL(2,1) DEFAULT 0
);

-- 3. 汇总表
CREATE TABLE daily_sales (
    date DATE PRIMARY KEY,
    total_orders INT,
    total_revenue DECIMAL(12,2),
    avg_order_value DECIMAL(10,2)
);
```

## 数据建模实践

### 实体关系设计

```sql
-- 一对多
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

-- 多对多
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

-- 自关联
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);
```

### 继承模式

```sql
-- 单表继承
CREATE TABLE vehicles (
    id INT PRIMARY KEY,
    type ENUM('car', 'motorcycle', 'truck'),
    brand VARCHAR(50),
    -- Car 字段
    num_doors INT,
    -- Motorcycle 字段
    engine_cc INT,
    -- Truck 字段
    payload_capacity DECIMAL(10,2)
);

-- 类表继承
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

-- 具体表继承
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

## 设计原则

```yaml
规范化优先:
  - 从高范式开始
  - 根据性能需求适当反范式
  - 记录反范式决策理由

命名规范:
  - 表名: 复数形式 (users, orders)
  - 主键: id 或 table_id
  - 外键: referenced_table_id
  - 时间戳: created_at, updated_at

约束使用:
  - 主键约束
  - 外键约束 (考虑性能影响)
  - 唯一约束
  - 检查约束
```

## 总结

数据库范式要点：

1. **1NF** - 原子性，属性不可分
2. **2NF** - 消除部分依赖
3. **3NF** - 消除传递依赖
4. **反范式** - 性能优化，适当冗余
5. **实践** - 平衡规范化与性能

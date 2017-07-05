---
layout: post
title: MySQL 分区表
category: ['MySQL']
tags: ['MySQL']
author: 景阳
email: jingyang@asiainfo.com
description: 介绍 MySQL 分区表
---

## 一、数据库表分区
### 1、横向分区
把数据库表横向分为几块。举例来说，如果一个表有100万条记录，横向分区就可以把表分成10块，每块有个10万条数据。

### 2、纵向分区
把有多个列的表分为几个表。比如一个表有20列，可以把这个表分为两个表，每个表10列 -- 这两个表还应该有外键关联。

## 二、MySQL 分区功能
MySQL 的 `PARTITION` 关键字支持横向分区。

### 1、range
基于属于一个给定**连续区间**的列值，把多行分配给分区。

* 插入数据时，如果区间没有包含分区的列值时会报错。

```sql
CREATE TABLE `trb3` (
  `id` int(11) default NULL,
  `name` varchar(50) default NULL,
  `purchased` date default NULL
) ENGINE=MyISAM
PARTITION BY RANGE (YEAR(purchased)) (
  PARTITION p0 VALUES LESS THAN (1990) ENGINE = MyISAM,
  PARTITION p1 VALUES LESS THAN (1995) ENGINE = MyISAM,
  PARTITION p2 VALUES LESS THAN (2000) ENGINE = MyISAM,
  PARTITION p3 VALUES LESS THAN (2005) ENGINE = MyISAM
)
```
**要注意的一点是 `CREATE TABLE` 和 `PARTITION` 是在一个语句里，中间没有分号隔开。**

### 2、list
类似于 range，区别在于 list 分区是基于列值匹配一个**离散值集合**中的某个值进行选择。

* 插入数据时，如果区间没有包含分区的列值时会报错。

```sql
CREATE TABLE employees (
    id INT NOT NULL,
    fname VARCHAR(30),
    lname VARCHAR(30),
    hired DATE NOT NULL DEFAULT '1970-01-01',
    separated DATE NOT NULL DEFAULT '9999-12-31',
    job_code INT,
    store_id INT
)
PARTITION BY LIST(store_id)
    PARTITION pNorth VALUES IN (3,5,6,9,17),
    PARTITION pEast VALUES IN (1,2,10,11,19,20),
    PARTITION pWest VALUES IN (4,12,13,14,18),
    PARTITION pCentral VALUES IN (7,8,15,16)
)；
```

### 3、hash
基于**用户定义**的表达式的返回值（整数）进行分区，该表达式使用将要插入到表中的这些行的列值进行计算。

```sql
CREATE TABLE employees (
    id INT NOT NULL,
    fname VARCHAR(30),
    lname VARCHAR(30),
    hired DATE NOT NULL DEFAULT '1970-01-01',
    separated DATE NOT NULL DEFAULT '9999-12-31',
    job_code INT,
    store_id INT
)
PARTITION BY HASH(store_id)
PARTITIONS 4；
```

* `PARTITIONS` 没有时默认分区是`1`。

### 4、key
类似于 hash。区别在于 key 分区只支持计算一列或多列，且 MySQL 服务器提供**自身**的哈希函数。

```sql
CREATE TABLE tk (
    col1 INT NOT NULL,
    col2 CHAR(5),
    col3 DATE
) 
PARTITION BY LINEAR KEY (col1)
PARTITIONS 3;
```

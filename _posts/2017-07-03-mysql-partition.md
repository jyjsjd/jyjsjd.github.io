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
### 1、语法
MySQL 的 `PARTITION` 关键字支持横向分区。

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

### 2、EXPLAIN PARTITIONS
可以在 `EXPLAIN` 关键字后面加 `PARTITIONS` 来查看有哪些分区被查询到了。

### 3、range


### 4、list

### 5、hash 或 key

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
### 1、range

### 2、list

### 3、hash 或 key

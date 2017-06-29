---
layout: post
title: 安装 MySQL 时要注意的设置
category: ['MySQL']
tags: ['MySQL']
author: 景阳
email: jingyang@asiainfo.com
description: MySQL 设置
---
## 一、背景
把 webapp 部署到 CentOS 服务器上，服务器预装了 MySQL 5.1。在保存数据的时候发现字符集和时间有一些问题：中文是乱码，时间不是北京时间。

## 二、默认字符集
建立数据库的时候，我已经把数据库和表的字符集都设置为了 utf8。在本地 macOS 系统上测试之后没什么问题，也没想过更改 MySQL 的默认字符集。搬到服务器上一测试问题就来了。查了一些文章，决定更改 MySQL 默认字符集。

* 查看 MySQL 默认字符集：
```
SHOW VARIABLES LIKE '%char%'
```
* 在 MySQL 配置文件 `/etc/my.cnf`中：
  - 文件最上方添加：
  ```
  [client]
  default-character-set=utf8
  ```
  - 在 `[mysqld]` 下增加:
  ```
  character-set-server=utf8
  ```
  - 保存并重启：
  ```
  service mysqld restart
  ```

## 三、时区
MySQL 默认是跟随系统时间的，顺手看了一下果然是体统时间不对：
```
date
```
再查看 MySQL 时间：
```
SELECT now();
```
当然也不对。


第一时间想到修改 MySQL 默认时区：
```
SET GLOBAL time_zone = '+8:00';
FLUSH PRIVILEGES; 
```

第二更改系统时间，并重启 MySQL：
```
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

## 后记
自己“一把年纪”才第一次弄这些，要学的东西很多，压力很大。


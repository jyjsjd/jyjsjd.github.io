---
layout: post
title: 搭建 zookeeper 集群
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: 搭建 zookeeper 集群
---

## 步骤
适用于在本地搭建伪集群或多台主机集群

1. 下载 zookeeper 解压到不同目录。

2. 建立 zookeeper 数据文件和日志文件存放目录。
  * 在每个数据文件目录中新建文件 `myid`，分别填入`不同`数字，必须在 **1~255** 之间。

3. 拷贝 zoo_expamle.cfg 到 zoo.cfg。

4. 修改每个 zookeeper 实例的 zoo.cfg：
  * clientPort：修改端口号，默认是2181。
  * dataDir：数据文件目录。
  * dataLogDir：日志文件目录。
  * 添加 server.x，x 就是 myid 中的数字。把**所有** zookeeper 实例都加上：

  ```
  server.0=localhost:2287:3387
  server.1=localhost:2288:3388
  server.2=localhost:2289:3389
  ```

  注意`主机号`后面有**两个**端口号。第一个端口 `follower` 连接 `master` 的端口，第二个端口是用来**选举** leader 的端口。

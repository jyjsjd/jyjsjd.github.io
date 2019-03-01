---
title: Elasticsearch 集群原理
category: ['Elasticsearch']
tags: ['Elasticsearch']
author: 景阳
email: jyjsjd@hotmail.com
description: Elasticsearch
---

## 名词

- node：一个运行中的 Elasticsearch 实例称为一个节点。

## 存储

ES 中数据存储按照如下顺序：

```
index -> type -> mapping -> document -> field
```

![save.png](/assets/img/elasticsearch/save.png)

## 集群

- 集群模式下 Elasticsearch 会选举一个节点为主节点（master）。主节点负责维护索引元数据、增加、删除节点等操作，不会涉及文档级别的操作。
- 主节点宕机后会重新选举。
- 当有节点加入集群或从集群中删除节点时，集群将会重新分布数据。
- 请求可以发给任意节点（包括主节点），每个节点都能把请求转发给文档所在节点，并能负责从各个节点收集数据最终转发给用户。此时这个节点称为协调节点（coordinating node）。

## 分片

- 索引是指向一个或多个物理分片（shard）的*逻辑命名空间*。
- 分片包括一个主分片（primary shard）和多个副本分片（replica shard）。
- 主分片的数目在索引创建时就已经确定了下来.
- 索引的所有文档都存放在主分片（最多能存储 `Integer.MAX_VALUE - 128` 个文档），副本分片只是主分片的拷贝。
- 主分片宕机后会由一个副本分片取代。

![node.png](/assets/img/elasticsearch/node.png)

## 写入

- 客户端选择一个 node 发送请求过去，这个 node 就是 coordinating node（协调节点）。
- coordinating node 对 document 进行路由，将请求转发给对应的 node（primary shard）。
- primary shard 处理请求，然后将数据同步到 replica node。
- coordinating node 如果发现 primary node 和所有 replica node 都完成之后，就返回响应结果给客户端。

![es-write.png](/assets/img/elasticsearch/es-write.png)


## 读取

### 根据文档 id 读取

客户端发送请求到任意一个 node，成为 coordinate node。
- coordinate node 对 doc id 进行哈希路由，将请求转发到对应的 node，此时会使用 round-robin随机轮询算法，在 primary shard 以及其所有 replica 中随机选择一个，让读请求负载均衡。
- 接收请求的 node 返回 document 给 coordinate node。
- coordinate node 返回 document 给客户端。

### 全文检索

- 客户端发送请求到一个 coordinate node。
- 协调节点将搜索请求转发到所有的 shard 对应的 primary shard 或 replica shard 都可以。
- query phase：每个 shard 将自己的搜索结果（其实就是一些 doc id）返回给协调节点，由协调节点进行数据的合并、排序、分页等操作，产出最终结果。
- fetch phase：接着由协调节点根据 doc id 去各个节点上拉取实际的 document 数据，最终返回给客户端。

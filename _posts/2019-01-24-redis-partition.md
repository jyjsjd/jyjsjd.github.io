---
title: 分片：如何把数据分布到多个 Redis 实例
category: ['Redis']
tags: ['Redis']
author: 景阳
email: jyjsjd@hotmail.com
description: Redis 分片
---

原文来自[Partitioning: how to split data among multiple Redis instances.](https://redis.io/topics/partitioning)

---

分片是把数据分布在多个 Redis 实例的过程，每个 Redis 实例都会存储数据的子集。本文第一部分介绍分片的概念，第二部分介绍几种 Redis 分片的选择。

## 为什么分片是有用的

Redis 分片主要是两个目的：

* 可以利用多台服务器的内存资源建立一个更大的数据库。在没有分片的情况下，Redis 只能利用单台服务器资源。
* 可以把计算能力扩展到多个核心和多个计算机上；把网络带宽扩展到多台计算机和网络适配器上。

## 分片基础

分片有多种标准。假设我们有4个 Redis 实例： **R0**，**R1**， **R2**， **R3**，还有多个代表用户的 key： `user:1`，`user:2 `等，我们有多种选择决定哪台实例存储这些特定的 key。换句话说也就是有多种系统能把一个特定的 key 映射到一个特定的实例上去。

一种最简单的方法是区间分片（**range partitioning**），就是把一定区间内的对象映射到特定的 Redis 实例上。比如，把用户 ID 在 0 到 10000 的存储在 **R0** 上，ID 10001 到 20000 存储到 **R1** 上等等。

这种方法很有效的并且在实践中得到了使用，但是它有一个缺点──必须要有一个表记录区间映射到实例的关系。~~This table needs to be managed and a table is needed for every kind of object~~（这句不明白），所以这种方式不太受欢迎，因为它比其他方法效率低很多。

另一种分片方法是哈希分片（**hash partitioning**）。这种方法对任何 key 都适用，无需要求 key 必须是 `object_name:\<id\>` 格式，而且非常简单：

* 用哈希函数（如 `crc32`）把 key 转换成一个数值。如一个 key 是 `foobar`，`crc32(foobar)` 会得到一个类似 93024922 的数值。
* 用取模运算把上一步得到的数值映射为 0 到 3 中的一个数字，根据这个数字把 key 存放到一个 Redis 实例中。93024922 模 4 等于 2，所以 foobar 应该存放在 **R2**。注意：取模运算返回的是除法运算的余数，在许多编程语言中都是用 `%` 符号实现。

还有许多其他分片的方法，但是通过以上两个例子你应该能理解这里的思想了。哈希分片中比较高级的部分称为**一致性哈希**（**consistent hashing**），一些 Redis 客户端和代理实现了这个方法。

## 分片不同的实现

可以选择由程序栈中不同部分负责分片。

* 客户端分片（**Client side partitioning**）：客户端能直接选择正确的 node 读、写特定的 key。很多 Redis 客户端实现了这种方式。 
* 代理分片（**Proxy assisted partitioning**）：客户端把请求发给实现了 Redis 协议的代理，而不是直接发给正确的 Redis 实例（instance）。代理会根据设置的分片模式把请求转发给正确的 Redis 实例（instance），再把响应发给客户端。 [Twemproxy](https://github.com/twitter/twemproxy) 实现了这种分片方式。
* 查询路由（**Query routing**）：客户端把请求发给一个随机的实例（instance），然后这个实例会把请求转发给正确的 node。Redis Cluster 在客户端的帮助下实现了一种混合形式的查询路由──请求不会从一个 Redis 实例转发（forward）到另一个，而是跳转（redirect）到正确的 node。

## 分片的缺陷

一些 Redis 特性和分区配合不是很好：

* 操作多个 key 通常不被支持。例如你不能对存储在不同 Redis 实例的 key 集合做交集（intersection ）操作（有其他间接方式可以实现）。
* 包含多个 key 的 Redis 事务不可用。
* 分片的粒度是 key，所以对一个有非常大的 key （如有序集合 sorted set）数据集做分片是不可行的。
* 使用分片时，数据处理会变复杂，例如必须处理多个  RDB / AOF  文件；为了做备份，必须聚集（aggregate）来自多个实例（instance）或主机（host）的持久化文件。
* 增加或减少容量会更加复杂。例如 Redis Cluster 支持运行时增加或减少 node，并透明地再平衡（rebalance）数据。

## 数据存储或缓存？

虽然把 Redis 分片用于数据存储（data store）或缓存（cache）从概念上来说都是一样的，但是作为数据存储时有一个显著的缺陷。用作数据存储时，特定的 key 必须始终被映射到相同的 Redis 实例上；用作缓存时，当一个 Redis 实例不可用时，使用另一个实例并不是什么大问题，改变实例-key关系映射（key-instance map）能改善系统的可用性（availability）。

当首选的 node 不可用时，一致性哈希实现能把特定的 key 转移到其他 node 上。相似的，如果新增了一个 node，部分新增的 key 会被存储到新的 node 上。

主要概念如下：

* 如果 Redis 被用作缓存，使用一致性哈希**扩展或收缩**（**scaling up and down**）会很简单。
* 如果 Redis 被用作数据存储，**会使用一个固定的实例-key关系映射，所以 node 的数量是固定的并不能改变**（ **a fixed keys-to-nodes map is used, so the number of nodes must be fixed and cannot vary**）。否则需要一个能在 node 增加或删除时再平衡 key 的系统，当前 Redis Cluster 能做到这一点。

##  Presharding

我们已经知道了分片的缺陷──除非把 Redis 作为缓存，否则增加或删除 node 会很复杂；使用固定的实例-key关系映射会更简单。但是数据存储的需求也在不断变化，今天我可能要10个 Redis 实例，但明天我可能要50个。

由于 Redis 十分轻量（一个备用实例仅使用1MB内存），解决这个问题的简单办法就是在一开始就部署大量实例。就算你只有一个服务器，你也可以一开始就在单台服务器上使用多个 Redis 实例进行分片。可以选择部署较多实例，比如32或64台实例对大多数用户来说都够用了。

这样在你的数据量增大、需要更多 Redis 服务器时，只要把实例从一台服务器移动到其他服务器上。一旦增加一台服务器，就把一半的实例转移到新服务器上，以此类推。

使用 Redis 复制（replication）可以把移动产生的下线的时间（downtime）最小化：

* 在新服务器启动新实例。
* 在转移数据时把这些实例作为源实例的备份。
* 关闭客户端。
* 更新移动的实例的 IP 地址配置。
* 发送 `SLAVEOF NO ONE` 到新服务器的实例。
* 用更新的配置重启客户端。
* 最后关闭在旧服务器上的实例。
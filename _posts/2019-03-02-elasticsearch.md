---
title: Elasticsearch 底层原理
category: ['Elasticsearch']
tags: ['Elasticsearch']
author: 景阳
email: jyjsjd@hotmail.com
description: Elasticsearch
---

## 名词

这些名词下面会用到，提前过一下。

- index：类似数据库，是存储、索引数据的地方。
- shard：index 由 shard 组成，一个 primary shard，其他是 replica shard。
- segment：shard 包含 segment，segment 中是倒排索引，它是不可变的；segment 内的文档数量的上限是 `2^31`。
- 倒排索引：倒排索引是 Lucene 中用于使数据可搜索的数据结构。
- translog：为防止 Elasticsearch 宕机造成数据丢失，每次写入数据时会同步写到 translog。
- commit point：列出所有已知 segment 的文件。

```
index -> shard -> segment -> 倒排索引
```

## 写数据

- 先写入内存 `buffer`（**这时数据是搜索不到的**），同时将数据写入 `translog` 日志文件。
  
  ![buffer.png](/assets/img/elasticsearch/buffer.png)

- 如果 `buffer` 快满了或者到一定时间（1秒），将 `buffer` 数据 **refresh** 到 `os cache` 即操作系统缓存。这时数据就**可以被搜索到了**。
  
  ![refresh.png](/assets/img/elasticsearch/refresh.png)

- 当 `translog` 达到一定长度的时候，就会触发 **flush** 操作。
  * 第一步将 `buffer` 中现有数据 `refresh` 到 `os cache` 中去，清空 `buffer`；
  * 然后，将一个 `commit point` 写入磁盘文件，同时强行将 `os cache` 中目前所有的数据都 **fsync** 到磁盘文件中去；
  * 最后清空现有 `translog` 日志文件并重建一个。
  
  ![flush.png](/assets/img/elasticsearch/flush.png)

整个过程如图：

![write.png](/assets/img/elasticsearch/write.png)

## 删除和更新

由于 `segment` 是不可变的，索引删除的时候既不能把文档从 `segment` 删除，也不能修改 `segment` 反映文档的更新。

- 删除操作，会生成一个 `.del` 文件，`commit point` 会包含这个 `.del` 文件。`.del` 文件将文档标识为 `deleted` 状态，在结果返回前从结果集中删除。
- 更新操作，会将原来的文档标识为 `deleted` 状态，然后新写入一条数据。查询时两个文档有可能都被索引到，但是被标记为删除的文档会被从结果集删除。

## 查询

查询的时候操作系统会将磁盘文件里的数据自动缓存到 `filesystem cache`。Elasticsearch 严重依赖于底层的 `filesystem cache`，如果给 `filesystem cache` 很大，可以容纳所有的 `index`、`segment` 等文件，那么搜索的时候就基本都是走内存的，性能会非常高；反之，搜索速度并不会很快。

![read.png](/assets/img/elasticsearch/read.png)

## segment 合并

`buffer` 每 `refresh` 一次，就会产生一个 `segment`（默认情况下是 1 秒钟产生一个），这样 `segment` 会越来越多，此时会定期执行 **merge**。

- 将多个 `segment` 合并成一个，并将新的 `segment` 写入磁盘；
- 新增一个 `commit point`，标识所有新的 `segment`；
- 新的 `segment` 被打开供搜索使用；
- 删除旧的 `segment`。

![merge.png](/assets/img/elasticsearch/merge.png)

## 参考

[Refresh vs flush](https://stackoverflow.com/questions/19963406/refresh-vs-flush)

[Making Changes Persistent](https://www.elastic.co/guide/en/elasticsearch/guide/master/translog.html)

[ES 工作原理](https://doocs.github.io/advanced-java/#/docs/high-concurrency/es-write-query-search)

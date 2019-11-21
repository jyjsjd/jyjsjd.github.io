---
title: Elasticsearch 乐观锁控制
category: ['Elasticsearch']
tags: ['Elasticsearch']
author: jyjsjd
email: jyjsjd@hotmail.com
description: Elasticsearch 乐观锁控制
---

## 乐观锁控制

Elasticsearch 是分布式的。当创建、修改或删除一个文档的时候，这个文档的新版本会被复制到集群中的其他节点。Elasticsearch 既是`异步`（asynchronous）的又是`同步`（concurrent）的，这意味着这些复制请求是同步发送的，但是有可能*不按顺序*（out of sequence）地到达目的地。Elasticsearch 需要保证旧版本的文档不能`覆盖`新版本的文档。

每个文档都有一个叫 `_version` 的数值属性，当文档变化时它会递增。Elasticsearch 就是利用 `_version` 保证对文档的变更是顺序进行的。如果一个旧版本的文档在新版本文档之后到达，旧文档会被直接忽略。

---

我们可以利用 `_version` 属性保证有冲突的修改不会导致数据丢失。在修改时指定 `_version` 的数值，如果这个数值不存在了，那么请求就会失败。

下面创建一个新的博客文档：

```shell
curl -X PUT "localhost:9200/website/blog/1/_create" -H 'Content-Type: application/json' -d'
{
  "title": "My first blog entry",
  "text":  "Just trying this out..."
}
'
```

响应体表明这个新建文档的 `_version` 为 1。现在我们要修改这个文档：首先加载这个文档到浏览器，作出修改，最后保存新版本。

---

首先加载文档：

```shell
curl -X GET "localhost:9200/website/blog/1"
```

响应体包含了 `_version` 为 1：

```json
{
  "_index" :   "website",
  "_type" :    "blog",
  "_id" :      "1",
  "_version" : 1,
  "found" :    true,
  "_source" :  {
      "title": "My first blog entry",
      "text":  "Just trying this out..."
  }
}
```

---

现在，我们要保存修改，在请求中指定 `_version` 为 2：

```shell
curl -X PUT "localhost:9200/website/blog/1?version=1" -H 'Content-Type: application/json' -d'
{
  "title": "My first blog entry",
  "text":  "Starting to get the hang of this..."
}
'
```

请求成功，响应体表明现在 `_version` 为 2：

```json
{
  "_index":   "website",
  "_type":    "blog",
  "_id":      "1",
  "_version": 2
  "created":  false
}
```

---

但是，如果我们在修改请求中指定 `version=1`，Elasticsearch 会响应 `409` 提示冲突，响应体如下：

```json
{
   "error": {
      "root_cause": [
         {
            "type": "version_conflict_engine_exception",
            "reason": "[blog][1]: version conflict, current [2], provided [1]",
            "index": "website",
            "shard": "3"
         }
      ],
      "type": "version_conflict_engine_exception",
      "reason": "[blog][1]: version conflict, current [2], provided [1]",
      "index": "website",
      "shard": "3"
   },
   "status": 409
}
```

## 使用外部系统的版本号

一个普遍的做法是把其他数据源作为主数据库，而把 Elasticsearch 作为搜索库，这就意味着对主库的所有修改都必须同步到 Elasticsearch 中。如果有多个进程负责数据同步任务，就有可能陷入上述的同步问题中。

如果主库已经有了一个版本号或者类似*时间戳*这种可以作为版本号的字段，那么就可以在 Elasticsearch 中复用相同的版本号，只需要在查询中加入 `version_type=external`。版本号必须是大于 `0` 小于 `9.2e+18` 的**整数**，也就是 Java 的 Long 型。

使用外部版本号和使用 Elasticsearch 内部的版本号略有不同。请求时 Elasticsearch 会检查外部版本号是否和请求中一致，而不是 `version`。如果请求成功，新的外部版本号会成为 `version` 的新值。

---

不仅可以在索引或删除文档时使用外部版本号，在新建文档时也可以使用外部版本号。

例如，在创建博客文档时设置版本为外部版本号 5，可以用如下请求：

```shell
curl -X PUT "localhost:9200/website/blog/2?version=5&version_type=external" -H 'Content-Type: application/json' -d'
{
  "title": "My first external blog entry",
  "text":  "Starting to get the hang of this..."
}
'
```

响应体中能看到 `_version` 变为了 5：

```json
{
  "_index":   "website",
  "_type":    "blog",
  "_id":      "2",
  "_version": 5,
  "created":  true
}
```

---

现在修改这个文档，把版本设置为 10：

```shell
curl -X PUT "localhost:9200/website/blog/2?version=10&version_type=external" -H 'Content-Type: application/json' -d'
{
  "title": "My first external blog entry",
  "text":  "This is a piece of cake..."
}
'
```

请求成功，现在 `_version` 变为 10：

```json
{
  "_index":   "website",
  "_type":    "blog",
  "_id":      "2",
  "_version": 10,
  "created":  false
}
```

---

title: Nginx 实现访问限速功能
category: ['Nginx']
tags: ['Nginx']
author: 景阳
email: jyjsjd@hotmail.com
description: Nginx 实现访问限速功能
---

#### OpenResty
用 Nginx 实现访问限速功能需要几个功能模块：`Lua 模块`和 `Redis 模块`。可以安装 Nginx 并安装模块，为了简单直接使用 `OpenResty`，内置了所有常规模块。

官方模块支持对单机版 Redis 的访问，可以直接参考文章：

[Nginx中使用 Lua+Redis 限制IP的访问频率](https://www.zifangsky.cn/1028.html)

#### 支持 Redis 集群
官方没有支持 Redis 集群的模块，但是在 GitHub 上有一些项目支持集群操作：

[resty-redis-cluster](https://github.com/steve0511/resty-redis-cluster)

----

操作步骤：
* 克隆项目到本地。
* 编译 `c` 文件为 `so` 文件：
`gcc redis_slot.c -fPIC -shared -o redis_slot.so`
* 把 `lua` 文件和 `so` 文件放在 OpenResty 安装目录下的 `lualib`。
* 在 `nginx.conf` http 模块添加：
`lua_shared_dict redis_cluster_slot_locks 100k;`

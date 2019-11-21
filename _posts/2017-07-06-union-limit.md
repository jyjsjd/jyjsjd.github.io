---

title: UNION 和 LIMIT 1
category: ['MySQL']
tags: ['MySQL']
author: jyjsjd
email: jyjsjd@hotmail.com
description: UNION 和 LIMIT 1
---

今天的另外两个知识点：

1、UNION：
*  查询中尽量不要使用 `OR`，可以用 `UNION` 代替。
*  `UNION` 和 `UNION ALL` 的不同点在于：`UNION` 会删除重复结果再返回，`UNION ALL` 不会。

2、LIMIT 1：如果明确知道查询的结果不会多于`一个`，可以在查询语句的末尾加上 `LIMIT 1`，这样 MySQL 在查到一条记录之后就会停止搜索。

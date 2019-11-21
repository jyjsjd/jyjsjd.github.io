---

title: MySQL LIKE 关键字
category: ['MySQL']
tags: ['MySQL']
author: jyjsjd
email: jyjsjd@hotmail.com
description: MySQL LIKE
---

## 一、背景
最近在看《MySQL 反模式》，看到了 `LIKE` 关键字的一些用法，在这里总结一下。

## 二、注意点
1. LIKE 'XXX%'：这样会用到索引。就和查字典一样，文字按拼音排序，查找以“A”开头的单词是可以用到索引的。
2. LIKE '%XXX'：不会用到索引。
3. 如果一定要用 “%XXX” 的模式：当需要搜索 email 列中以 .com 结尾的字符串而希望走索引时候，可以考虑数据库存储一个反向的内容reverse_email：
```sql 
SELECT * FROM `table` WHERE `reverse_email` LIKE REVERSE('%.com');
```
4. 在《MySQL 反模式》这本书里看到一个用法：
```sql
SELECT * FROM Comments AS c WHERE '1/4/6/7/' LIKE c.path || '%';
```
反过来使用 LIKE 关键字，这句查询会匹配到 path 为“1/4/6/%”、“1/4/%”以及“1/%”的节点。 

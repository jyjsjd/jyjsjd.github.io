---
title: Elasticsearch wildcard搜索
category: ['Elasticsearch']
tags: ['Elasticsearch']
author: 景阳
email: jyjsjd@hotmail.com
---

本文针对Elasticsearch 6.1版本。

## Wildcard 搜索

类似于MySQL的模糊搜索，适用于*string*类型，占位符有两个：

- `?`：匹配**一个**字符；
- `*`：匹配**多个**字符。

查询时用*wildcard*关键字搜索，如：

```javascript
{
  "query": {
    "bool": {
      "must": [
        {
          "wildcard": {
            "title": "Z*"
          }
        }
      ]
    }
  }
}
```

## 禁止分词

Elasticsearch搜索时会对*文档*和*搜索词*进行分词，有时这不符合我们的需求，因为分词以后搜出来的结果可能多了或者少了，一些特殊的符号比如标点符号也会搜不到了。

- 禁止文档分词：设置文档的字段类型为`keyword`；
- 禁止搜索词分词：在字段名后面加上`.keyword`，如上文把`title`改为`title.keyword`。

## 注意

在搜索词前面加`?`或`*`，会导致搜索的效率降低。

## 参考

[wildcard-query-field-params](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html#wildcard-query-field-params)

[keyword](https://www.elastic.co/guide/en/elasticsearch/reference/current/keyword.html)

[analysis-keyword-analyzer](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-keyword-analyzer.html)

[normalizer](https://www.elastic.co/guide/en/elasticsearch/reference/6.1/normalizer.html)

[wild-card-queries-do-not-work-after-normalization](https://discuss.elastic.co/t/wild-card-queries-do-not-work-after-normalization/91386)
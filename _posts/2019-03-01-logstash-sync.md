---
title: Logstash 同步 MySQL 数据到 Elasticsearch
category: ['Logstash']
tags: ['Logstash']
author: 景阳
email: jyjsjd@hotmail.com
description: Logstash
---

Logstash 方案是不停机方案，没有增加中间件（ELK 本身就有 L），甚至可以作为实时同步的工具。

## 使用方法

在数据库中建 customer 表并加入几条数据，这个表就是要同步到 Elasticsearch 的数据：

```sql 
CREATE TABLE customer (
id INT(6)  AUTO_INCREMENT PRIMARY KEY,
firstname VARCHAR(30) NOT NULL,
lastname VARCHAR(30) NOT NULL,
email VARCHAR(50),
regdate TIMESTAMP
)
INSERT INTO `ecomdb`.`customer` (`id`, `firstname`, `lastname`, `email`, `regdate`) VALUES (1, 'Roger', 'Federer', 'roger.federer@yomail.com', '2019-01-21 20:21:49');
INSERT INTO `ecomdb`.`customer` (`id`, `firstname`, `lastname`, `email`, `regdate`) VALUES (2, 'Rafael', 'Nadal', 'rafael.nadal@yomail.com', '2019-01-22 20:21:49');
INSERT INTO `ecomdb`.`customer` (`id`, `firstname`, `lastname`, `email`, `regdate`) VALUES (3, 'John', 'Mcenroe', 'john.mcenroe@yomail.com', '2019-01-23 20:21:49'); 
INSERT INTO `ecomdb`.`customer` (`id`, `firstname`, `lastname`, `email`, `regdate`) VALUES (4, 'Ivan', 'Lendl', 'ivan.lendl@yomail.com', '2019-01-23 23:21:49'); 
INSERT INTO `ecomdb`.`customer` (`id`, `firstname`, `lastname`, `email`, `regdate`) VALUES (5, 'Jimmy', 'Connors', 'jimmy.connors@yomail.com', '2019-01-23 22:21:49');
```

---

在 Elasticsearch 创建 index "test" 和 type "doc"，对应于 MySQL 的表结构：

```shell
curl -XPUT "http://localhost:9200/test" -H "Content-Type: application/json" -d'
{
  "mappings": {
    "doc": {
      "properties": {
        "id": {
          "type": "keyword"
        },
        "firstname": {
          "type": "text"
        },
        "lastname": {
          "type": "text"
        },
        "email": {
          "type": "keyword"
        },
        "regdate": {
          "type": "date"
        }
      }
    }
  }
}'
```

---

创建 logstash-sync.conf 文件并加入以下内容：

```
input {
  jdbc {
    jdbc_driver_library => "./mysql-connector-java-5.1.44.jar"
    jdbc_driver_class => "com.mysql.jdbc.Driver"
    jdbc_connection_string => "jdbc:mysql://localhost:3306/test"
    jdbc_user => "root"
    jdbc_password => "123456"
    tracking_column => "regdate"
    use_column_value => true
    statement => "SELECT * FROM customer where regdate >:sql_last_value;"
    schedule => " * * * * * *"
  }
}
output {
  elasticsearch {
    document_id => "%{id}"
    document_type => "doc"
    index => "test"
    hosts => ["http://localhost:9200"]
  }
  stdout{
    codec => rubydebug
  }
}
```

配置可分为两部分 input 和 output （还可能有 filter）。

input 定义了输入源：

- 使用 JDBC 插件，JDBC 前 5 行定义了数据源信息；
- tracking_column：跟踪记录变化的字段；
- use_column_value：设为 true 时，:sql_last_value 使用 tracking_column 的值；
- schedule：cron 表达式，表示执行周期；
- document_id：Elasticsearch 使用的 ID；
- 还可以设置分页查询等：jdbc_paging_enabled => "true" jdbc_page_size => "500"。

output 定义输出源是 Elasticsearch，并指明 index、type、id。

---

启动 logstash 并使用上面的配置：

```shell
logstash -f logstash-sync.conf
```

查询 test 索引，可以看到数据都被同步到了 Elasticsearch：

```shell
curl -X GET "localhost:9200/test/_search"
```

## 思考

上述使用仅仅是同步单表，并且数据量不大，可以直接把 Elasticsearch 作为输出源。如果数据量较大，用 Logstash 直接把数据同步到 Elasticsearch 会对服务造成很大压力。

所以，可以把输出源设置为其他缓冲区，如消息队列，通过消费消息把消息批量同步到 Elasticsearch。

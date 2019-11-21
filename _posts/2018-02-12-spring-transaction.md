---

title: Spring事务隔离和事务传播
category: ['Java']
tags: ['Java']
author: jyjsjd
email: jyjsjd@hotmail.com
description: Spring事务隔离级别和事务传播
---

* TOC
{:toc}

#### 1. TransactionDefinition接口
TransactionDefinition接口定义了 Spring 中与事务有关的属性和方法：

```java
public interface TransactionDefinition {
  int PROPAGATION_REQUIRED = 0;
  int PROPAGATION_SUPPORTS = 1;
  int PROPAGATION_MANDATORY = 2;
  int PROPAGATION_REQUIRES_NEW = 3;
  int PROPAGATION_NOT_SUPPORTED = 4;
  int PROPAGATION_NEVER = 5;
  int PROPAGATION_NESTED = 6;
  int ISOLATION_DEFAULT = -1;
  int ISOLATION_READ_UNCOMMITTED = 1;
  int ISOLATION_READ_COMMITTED = 2;
  int ISOLATION_REPEATABLE_READ = 4;
  int ISOLATION_SERIALIZABLE = 8;
  int TIMEOUT_DEFAULT = -1;

  int getPropagationBehavior();

  int getIsolationLevel();

  int getTimeout();

  boolean isReadOnly();

  String getName();
}
```

#### 2. 事务隔离级别
* TransactionDefinition.ISOLATION_DEFAULT：默认值，表示使用底层数据库的默认隔离级别。对于大多数数据库来说就是 TransactionDefinition.ISOLATION_READ_COMMITTED（读已提交）。
* TransactionDefinition.ISOLATION_READ_UNCOMMITTED：读未提交，代表一个事务可以读取另一个事务修改但未提交的数据。该级别会导致脏读和不可重复读。
* TransactionDefinition.ISOLATION_READ_COMMITTED：读已提交，代表一个事务只可以读另一个事务已提交修改。该级别可以防止脏读。
* TransactionDefinition.ISOLATION_REPEATABLE_READ：可以重复读，代表一个事务可多次执行同一个查询，并且每次结果都一样。该级别可以防止脏读和不可重复读。
* TransactionDefinition.ISOLATION_SERIALIZABLE：可串行化，所有事务依次逐个执行，可防止脏读、不可重复读和幻读。

#### 3. 事务传播属性
所谓事务的传播行为是指，如果在开始当前事务之前，一个事务上下文已经存在，此时有若干选项可以指定一个事务性方法的执行行为。
* TransactionDefinition.PROPAGATION_REQUIRED：如果当前存在事务，则加入该事务；如果当前没有事务，则新建事务。
* TransactionDefinition.PROPAGATION_REQUIRES_NEW：创建一个新事务，如果当前存在事务，则把当前事务`挂起`。
* TransactionDefinition.PROPAGATION_SUPPORTS：如果当前存在事务，则加入当前事务；如果当前没有事务，则以非事务方式运行。
* TransactionDefinition.PROPAGATION_NOT_SUPPORTED：以`非事务`方式运行，如果当前存在事务，则把当前事务`挂起`。
* TransactionDefinition.PROPAGATION_NEVER：以`非事务`方式运行，如果当前存在事务，则抛异常。
* TransactionDefinition.PROPAGATION_MANDATORY：如果当前存在事务，则加入事务；如果不存在事务，则抛异常。
* TransactionDefinition.PROPAGATION_NESTED：如果当前存在事务，则创建一个事务作为当前事务的`嵌套事务`运行；如果当前没有事务，则等价于TransactionDefinition.PROPAGATION_REQUIRED。

---

title: MyBatis 缓存
category: ['MyBatis']
tags: ['MyBatis']
author: 景阳
email: jyjsjd@hotmail.com
description: MyBatis 缓存
---

## 一级缓存

### 介绍

在应用运行过程中，我们有可能在一次数据库会话中，执行多次查询条件完全相同的 `SQL`，`MyBatis`提供了一级缓存的方案优化这部分场景，如果是相同的`SQL`语句，会优先命中一级缓存，避免直接对数据库进行查询，提高性能。

一级缓存有两个选项：`SESSION` （默认）或 `STATEMENT`。`SESSION`级别在一个`MyBatis会话`中执行的所有语句，都会共享这一个缓存；`STATEMENT`级别，可以理解为缓存只对当前执行的这一个`Statement`有效。

### 开启方法

springboot配置文件开启 `MyBatis` 一级缓存方法：

```yml
mybatis:
  configuration:
    # 开启一级缓存，默认 session 级别（另一个是 statement）
    local-cache-scope: session
```

### 原理

每个`SqlSession`中持有了`Executor`，`Executor`中有一个`LocalCache`。当用户发起查询时，`MyBatis`根据当前执行的语句生成`MappedStatement`，在`Local Cache`进行查询，如果缓存命中的话，直接返回结果给用户，如果缓存没有命中的话，查询数据库，结果写入`Local Cache`，最后返回结果给用户。

![2017-11-23-16-13-29](/assets/img/2017-11-23-16-13-29.jpg)



`MappedStatement`的`Id`、SQL的`offset`、SQL的`limit`、`SQL`本身以及SQL中的`参数`传入了CacheKey这个类，最终构成CacheKey。只要两条SQL的下列五个值相同，即可以认为是相同的SQL：

``Statement Id + Offset + Limit + Sql + Params``

----

## 二级缓存

### 介绍

二级缓存是在多个SqlSession之间共享的缓存。二级缓存开启后，同一个namespace下的所有操作语句，都影响着同一个Cache，即二级缓存被多个SqlSession共享，是一个全局的变量。
当开启缓存后，数据的查询执行的流程就是``二级缓存 -> 一级缓存 -> 数据库``。

### 开启方法

在 springboot 的配置文件中写入：

```yml
mybatis:
  configuration:
    # 开启二级缓存
    cache-enabled: true
```

Mapper配置文件中写入：

```xml
<cache/>
```

可配置的属性有：

* type：cache使用的类型，默认是`PerpetualCache`，在一级缓存中默认也使用这个类。
* eviction： 定义回收的策略，常见的有`FIFO`，`LRU`（默认）。
* flushInterval： 配置一定时间后自动刷新缓存，单位是毫秒。
* size： 最多缓存对象的个数，默认`1024`个。
* readOnly： 是否只读，若配置可读写，则需要对应的实体类能够序列化。
* blocking： 若缓存中找不到对应的key，是否会一直blocking，直到有对应的数据进入缓存。

**如果使用默认的`PerpetualCache`会导致出现多个namespace中的数据不一致现象。**

### 原理

`CachingExecutor`内部持有`TransactionalCache`，执行 SQL 时会先去查看缓存：

```java
// 执行SQL语句
@Override
public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql)
      throws SQLException {
    Cache cache = ms.getCache(); // 获取缓存
    if (cache != null) {
      flushCacheIfRequired(ms); // insert/update/delete语句进入此方法刷新缓存
      if (ms.isUseCache() && resultHandler == null) {
        ensureNoOutParams(ms, parameterObject, boundSql);
        @SuppressWarnings("unchecked")
        List<E> list = (List<E>) tcm.getObject(cache, key); // 从缓存取数据
        if (list == null) {
          list = delegate.<E> query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
          tcm.putObject(cache, key, list); // 没有取到缓存，把结果放入 cache，这里包装了 Cache
        }
        return list;
      }
    }
    return delegate.<E> query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
  }

// 清除缓存
private void flushCacheIfRequired(MappedStatement ms) {
    Cache cache = ms.getCache();
    if (cache != null && ms.isFlushCacheRequired()) {      
      tcm.clear(cache);
    }
  }
```

----

```Cache cache = ms.getCache()```获取缓存时查看 cache 到底是什么：

![debug](/assets/img/debug.png)

因为我没有指定 cache 类型，最终使用了默认的`PerpetualCache`。

使用缓存时，就是直接调用 `Cache` 接口定义的方法，如获得缓存调用 `getObject`、删除调用 `removeObject`：

![cache-uml](/assets/img/cache-uml.png)

----

`TransactionalCache`内部持有一个 `Map`，包装了 Cache：

```java
public class TransactionalCacheManager {

  // 缓存
  private Map<Cache, TransactionalCache> transactionalCaches = new HashMap<Cache, TransactionalCache>();

  public void clear(Cache cache) {
    getTransactionalCache(cache).clear();
  }

  public Object getObject(Cache cache, CacheKey key) {
    return getTransactionalCache(cache).getObject(key);
  }
  
  public void putObject(Cache cache, CacheKey key, Object value) {
    getTransactionalCache(cache).putObject(key, value);
  }

  public void commit() {
    for (TransactionalCache txCache : transactionalCaches.values()) {
      txCache.commit();
    }
  }

  public void rollback() {
    for (TransactionalCache txCache : transactionalCaches.values()) {
      txCache.rollback();
    }
  }

  private TransactionalCache getTransactionalCache(Cache cache) {
    TransactionalCache txCache = transactionalCaches.get(cache);
    if (txCache == null) {
      txCache = new TransactionalCache(cache);
      transactionalCaches.put(cache, txCache);
    }
    return txCache;
  }

}
```

CacheKey 的规则和一级缓存还是一样的。

----

## 使用 Redis 作为二级缓存

* 继承 Cache 接口，实现对应方法。

* 在`<cache/>`中指定属性 `type `为实现类：

  ```xml
  <!-- 开启基于redis的二级缓存 -->
  <cache type="com.xxx.cache.util.RedisCache"/>
  ```

* 在查询上标记是否使用、刷新缓存：

  ```xml
  <!--使用缓存-->
  <select id="select" resultType="com.xxx.cache.dao.model.Product" useCache="true">
      SELECT *
      FROM products
      WHERE id = #{id}
  </select>
  
  <!--刷新缓存-->
  <update id="update" parameterType="com.xxx.cache.dao.model.Product" flushCache="true">
     UPDATE products
     SET name = #{name}, price = #{price}
     WHERE id = #{id}
  </update>
  ```

样例[请看](https://github.com/jyjsjd/spring-boot-mybatis-with-redis)。

----

## Spring Cache -- 注解驱动的缓存

### 开启

Springboot 开启缓存要提供一个 `CacheManager`，注解`@EnableCaching` 开启缓存：

```java
@Configuration
@EnableCaching
public class RedisConfig extends CachingConfigurerSupport {

    @Bean("cache")
    public CacheManager cacheManager(RedisTemplate redisTemplate) {
        return new RedisCacheManager(redisTemplate);
    }

    @Bean
    @SuppressWarnings("unchecked")
    public RedisTemplate redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate template = new RedisTemplate();
        template.setConnectionFactory(factory);
        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);

        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);

        jackson2JsonRedisSerializer.setObjectMapper(om);
        template.setValueSerializer(jackson2JsonRedisSerializer);
        template.afterPropertiesSet();

        return template;
    }
}
```

----

### 注解

Spring的缓存是围绕切面构建的，所有注解都能运用在方法或类上。当将其放在单个方法上时，缓存只会运用到这个方法上。如果注解放在类级别的话，那么缓存就会应用到类的所有方法上。

| 注解        | 描述                                                         |
| ----------- | :----------------------------------------------------------- |
| @Cacheable  | 在调用方法之前，首先在缓存中查找方法的返回值。如果能够找到，就会返回缓存。否则的话方法就会被调用，返回值会放到缓存中。 |
| @CachePut   | 将方法的返回值放到缓存中。在方法的调用前并不会检查缓存，方法始终都会被调用。 |
| @CacheEvict | 将方法的返回值放到缓存中。在方法的调用前并不会检查缓存，方法始终都会被调用。 |
| @Caching    | 分组的注解，能够同时应用多个其他的缓存注解。                 |

----

### 注解的属性

`@Cacheable`和`@CachePut`注解都可以填充缓存，但是它们的工作方式略有差异。`@Cacheable`首先在缓存中查找条目，如果找到了匹配的条目，那么就不会调用方法。如果没有找到匹配的条目，方法会被调用并且返回值要放到缓存中。而`@CachePut`不会在缓存中检查匹配的值，目标方法总是会被调用，并将返回值添加到缓存中。

| 属性      | 类别     | 描述                                                         |
| --------- | -------- | ------------------------------------------------------------ |
| value     | String[] | 要使用的缓存名称                                             |
| condition | String   | SpEL表达式，如果得到的值是false的话，不会将缓存应用到方法调用上 |
| key       | String   | SpEL表达式，用来计算自定义的缓存key                          |
| unless    | String   | SpEL表达式，用来计算自定义的缓存key                          |

----

## 参考

[聊聊MyBatis缓存机制](https://tech.meituan.com/mybatis_cache.html)

[Spring实战](https://book.douban.com/subject/24714203/)


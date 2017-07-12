---
layout: post
title: Ehcache（一）缓存配置
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Ehcache 缓存配置
---

## 一、XML配置文件
1. `ehcache` 默认会在 `classpath` 下查找名为 `ehcache.xml` 的文件，当然也可以自定义名称。
2. 如果没有找到 ehcache.xml，ehcache 会默认试用 `ehcache-failsafe.xml`，它被打包在 ehcache 的 `jar` 文件中。如果用户使用的是这个文件，ehcache 会报一个`警告`，让用户自己定义一个配置文件。
3. `defaultCache` 配置会被应用到所有没有被显示声明的缓存中。这个配置不是必需的。

## 二、动态改变配置
1. `禁用`动态改变配置：
  * 在 XML 文件中把属性 dynamicConfig 设置为 false。
  * 在代码中禁用：
  ```java
  Cache cache = manager.getCache("sampleCache");
  cache.disableDynamicFeatures();
  ```
2. 可以动态改变的配置：
  * timeToLive：一个 element 在`缓存中存在`的最长时间（秒），不论它是否被访问过都会被清除。
  * timeToIdle：一个 element `未被访问`的最长时间（秒），经过这段时间后被清除。
  * maxEntriesLocalHeap
  * maxBytesLocalHeap
  * maxEntriesLocalDisk
  * maxBytesLocalDisk
  ```java
  Cache cache = manager.getCache("sampleCache");
  CacheConfiguration config = cache.getCacheConfiguration();
  config.setTimeToIdleSeconds(60);
  config.setTimeToLiveSeconds(120);
  config.setmaxEntriesLocalHeap(10000);
  config.setmaxEntriesLocalDisk(1000000);
  ```

## 三、传递拷贝而非引用
默认情况下 `get()` 方法会取得缓存中数据的**引用**，之后对这个数据的所有改变都会**立刻**反映到缓存中。有些时候用户想要获得一个缓存数据的`拷贝`，对这个拷贝的操作不会影响到缓存。

1. XML 配置： 把 `copyOnRead` 和 `copyOnWrite` 设置为 `true`

```xml
<cache name="copyCache"
 maxEntriesLocalHeap="10"
 eternal="false"
 timeToIdleSeconds="5"
 timeToLiveSeconds="10"
 copyOnRead="true"
 copyOnWrite="true">
 <copyStrategy class="com.company.ehcache.MyCopyStrategy"/>
</cache>
```

2. Java 代码中：

```java
CacheConfiguration config = new CacheConfiguration("copyCache", 1000).copyOnRead(true).copyOnWrite(true);
Cache copyCache = new Cache(config);
```

---

在 `get()` 或者 `put()` 方法获得拷贝的时候，可以自定义`拷贝策略`。

1. 实现接口 `net.sf.ehcache.store.compound.CopyStrategy`。
2. XML 中配置 `<copyStrategy class="com.company.ehcache.MyCopyStrategy"/>`。
3. Java 代码中：
```java
CacheConfiguration cacheConfiguration = new CacheConfiguration("copyCache", 10);
CopyStrategyConfiguration copyStrategyConfiguration = new CopyStrategyConfiguration();
copyStrategyConfiguration.setClass("com.company.ehcache.MyCopyStrategy");
cacheConfiguration.addCopyStrategy(copyStrategyConfiguration);
```

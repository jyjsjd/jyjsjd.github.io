---
layout: post
title: 同一个 JVM 不能出现两个同名的 ehcache CacheManager
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: CacheManager
---

ApplicationContext 启动时遇到这个问题：

```
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'redisService' defined in class path resource [spring-bpchain.xml]: Instantiation of bean failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [com.asiainfo.cache.RedisService]: Constructor threw exception; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'ehCacheManagerFactoryBean' defined in URL [file:/Users/jyjsjd/Gogs/smart-cache/target/classes/spring-ehcache.xml]: Invocation of init method failed; nested exception is net.sf.ehcache.CacheException: Another unnamed CacheManager already exists in the same VM. Please provide unique names for each CacheManager in the config or do one of following:
1. Use one of the CacheManager.create() static factory methods to reuse same CacheManager with same name or create one if necessary
2. Shutdown the earlier cacheManager before creating new one with same name.
The source of the existing CacheManager is: InputStreamConfigurationSource [stream=java.io.BufferedInputStream@306e95ec]
```

其实错误栈说得很明白了：JVM 出现了两个同名的 CacheManager。ehcache 从2.5版本开始禁止出现同名 CacheManager，把 ehcache 替换成低版本不是解决问题的正道。

正常情况下 spring 会报这个错都是 ApplicationContext 加载了两次，检查一下 spring 的启动日志，看一下哪边第二次启动就可以了。

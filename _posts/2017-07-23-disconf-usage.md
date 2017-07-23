---
layout: post
title: disconf 使用
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: disconf 使用
---

上一篇讲了如何安装 disconf-web，这一篇注重于如何使用。

### 使用方法
1. 添加 maven 依赖：
```xml
<dependency>
    <groupId>com.baidu.disconf</groupId>
    <artifactId>disconf-client</artifactId>
    <version>2.6.36</version>
</dependency>
```

3. disconf 启动文件，disconf.properties：
* conf_server_host：配置服务器，也就是 **disconf-web** 的地址
* app：`App` 名字。
* version：版本，和 `APP` 的版本一致。
* env：环境，和 `APP` 的版本一致。
* debug：和 `APP` 的版本一致。

```
# 是否使用远程配置文件
# true(默认)会从远程获取配置 false则直接获取本地配置
enable.remote.conf=true

#
# 配置服务器的 HOST,用逗号分隔  127.0.0.1:8000,127.0.0.1:8000
#
conf_server_host=127.0.0.1:8080

# 版本, 请采用 X_X_X_X 格式
version=1_0_0_0

# APP 请采用 产品线_服务名 格式
app=disconf_demo

# 环境
env=rd

# debug
debug=true

# 忽略哪些分布式配置，用逗号分隔
ignore=

# 获取远程配置 重试次数，默认是3次
conf_server_url_retry_times=3
# 获取远程配置 重试时休眠时间，默认是5秒
conf_server_url_retry_sleep_seconds=5
```

3. 配置文件添加 disconf 支持：
```xml
<context:component-scan base-package="com.example"/>

<aop:aspectj-autoproxy proxy-target-class="true"/> <!-- 必须支持 AOP -->

<!-- 使用disconf必须添加以下配置 -->
<bean id="disconfMgrBean" class="com.baidu.disconf.client.DisconfMgrBean"
      destroy-method="destroy">
    <property name="scanPackage" value="com.example.disconf.demo"/> <!-- 要扫描的包 -->
</bean>
<bean id="disconfMgrBean2" class="com.baidu.disconf.client.DisconfMgrBeanSecond"
      init-method="init" destroy-method="destroy">
</bean>
```

4. 添加要托管的文件：
```xml
<!-- 使用托管方式的disconf配置(无代码侵入, 配置更改会自动reload)-->
<bean id="configproperties_disconf" class="com.baidu.disconf.client.addons.properties.ReloadablePropertiesFactoryBean">
  <property name="locations">
    <list> 
      <!-- 要托管的文件列表 -->
      <value>classpath:/autoconfig.properties</value>
    </list>
  </property>
</bean>

<bean id="propertyConfigurer" class="com.baidu.disconf.client.addons.properties.ReloadingPropertyPlaceholderConfigurer">
  <property name="ignoreResourceNotFound" value="true" />
  <property name="ignoreUnresolvablePlaceholders" value="true" />
  <property name="propertiesArray">
    <list>
      <ref bean="configproperties_disconf" />
    </list>
  </property>
</bean>
```

5. 把文件上传到 disconf-web。

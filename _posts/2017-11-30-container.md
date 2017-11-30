---
layout: post
title: Spring 容器启动
category: ['Spring']
tags: ['Spring']
author: 景阳
email: jyjsjd@hotmail.com
description: Spring 容器启动
---

### 一、容器启动
容器启动后，首先会加载 `Configuration Metadata`，解析后编组为相应的 `BeanDefinition`，最后将 BeanDefinition 注册到相应的`BeanDefinitionRegistry`。

### 二、Bean 的实例化
在启动阶段，所有 bean 的信息都已经以 BeanDefinition 的方式注册到 BeanDefinitionRegistry，当方法明确地以 getBean 方法请求某个对象，或者因为对象的依赖关系隐式地请求某个对象，就会触发 Bean 的实例化。

容器会首先检查对象是否已经实例化，如果没有就会根据 BeanDefinition 的信息实例化对象，并注入依赖。如果对象实现了回调接口，也会根据回调接口的要求装配它。

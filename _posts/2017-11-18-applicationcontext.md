---
layout: post
title: ApplicationContext 继承关系
category: ['Spring']
tags: ['Spring']
author: 景阳
email: jyjsjd@hotmail.com
description: ApplicationContext 继承关系
---

<img src="/assets/img/applicationcontext.png" width="800" height="200"/>

* BeanFactory：基础的 IoC 容器。默认使用**延迟**初始化，当客户端访问容器中的某个托管对象时，才对该托管对象进行初始化并注入。因此容器初始化较快，所需的资源较少。

* ApplicationContext：在 BeanFactory 的基础上构建，除了 IoC 的基础支持，还提供了事件发布、国际化等高级特性。ApplicationContext 托管的对象在容器启动时就完成初始化。

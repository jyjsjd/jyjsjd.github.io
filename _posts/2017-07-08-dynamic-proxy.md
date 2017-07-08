---
layout: post
title: Java 动态代理
category: ['design pattern']
tags: ['design pattern']
author: 景阳
email: jyjsjd@hotmail.com
description: 动态代理
---

## 一、代理模式
代理模式，是为对象提供一个代理以控制对对象的访问。代理类负责为委托类预处理消息，过滤消息并转发消息，以及进行消息被委托类执行后的后续处理。

![proxy.png](/assets/img/proxy.png)

## 二、JDK 提供的代理模式
1. java.lang.reflect.Proxy：这是 Java 动态代理机制的主类，它提供了一组静态方法来为一组接口`动态`地生成代理类及其对象。
2. java.lang.reflect.InvocationHandler：这是调用处理器接口，它自定义了一个 `invoke` 方法，用于集中处理在动态代理类对象上的方法调用，通常在该方法中实现对委托类的`代理访问`。
3. java.lang.ClassLoader：这是类装载器类，负责将类的字节码装载到 Java 虚拟机（JVM）中并为其定义类对象，然后该类才能被使用。**Proxy 静态方法生成动态代理类同样需要通过类装载器来进行装载才能使用，它与普通类的唯一区别就是其字节码是由 JVM 在运行时`动态`生成的而非预存在于任何一个 .class 文件中**。

![javaproxy.png](/assets/img/javaproxy.png)

## 参考文献
[Java 动态代理机制分析及扩展，第 1 部分](https://www.ibm.com/developerworks/cn/java/j-lo-proxy1/index.html)

[Java JDK 动态代理使用及实现原理分析](http://blog.jobbole.com/104433/)

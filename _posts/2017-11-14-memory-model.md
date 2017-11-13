---
layout: post
title: Java 内存模型的基本原则
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Java 内存模型的基本原则
---

#### 原子性
原子操作不可中断，也不会被多线程干扰。

* volatile：对 long 或 double 来说，操作不是原子的。

#### 有序性
* 指令重排：会导致读操作发生在写操作之前。

#### 可见性
* happens-before：只有写入操作发生在读取操作之前时，才保证一个线程写入的结果对另一个线程的读取是可视的。
* 逃逸分析：对象在上下文中是否可见。

**synchronized 和 volatile 构造 happen-before 关系；Thread.start() 和 Thread.join() 方法形成 happen-before 关系。**

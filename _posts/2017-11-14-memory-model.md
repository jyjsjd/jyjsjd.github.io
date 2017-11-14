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
  * 栈上分配：如果对象不会逃逸出方法之外，就可以让对象在栈上分配，这样对象所占空间就会随着栈帧退出而销毁，减轻了垃圾回收压力。
  * 锁消除：不可能被共享的对象可以消除这些对象的锁操作。
  * 标量替换：原始数据类型（int、short、byte、boolean）不能分解，称为标量；数据可以继续分解，称为聚合量。如果一个对象不会在方法外被访问到，并且对象是聚合量，编译器可以不创建这个对象，直接创建它的成员变量来代替。

**synchronized 和 volatile 构造 happen-before 关系；Thread.start() 和 Thread.join() 方法形成 happen-before 关系。**

---
layout: post
title: Java 多线程特性
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Java 多线程特性
---

#### 原子性
原子操作不可中断，也不会被多线程干扰。对 long 或 double 来说，操作不是原子的。
* 变量使用 volatile 关键字修饰；
* 加锁。

#### 有序性
* 指令重排：不会导致**单线程**的语义修改，但会导致**多线程**语义不一致。

#### 可见性
* volatile：变量的写先于读，**保证变量看到的随时是自己的最新值**。

* happens-before：
  - 加锁必然发生于解锁前；
  - 传递性：A 先于 B，B 先于 C，A 必然先于 C；
  - 线程的 `start()` 方法先于其他每一个方法；
  - 线程的所有方法先于 `Thread.join()`；
  - 线程的`中断`先于被中断的代码；
  - 构造函数的结束先于 `finalize()` 方法。

* 逃逸分析：对象在上下文中是否可见。
  - 栈上分配：如果对象不会逃逸出方法之外，就可以让对象在栈上分配，这样对象所占空间就会随着栈帧退出而销毁，减轻了垃圾回收压力。
  - 锁消除：不可能被共享的对象可以消除这些对象的锁操作。
  - 标量替换：原始数据类型（int、short、byte、boolean）不能分解，称为标量；数据可以继续分解，称为聚合量。如果一个对象不会在方法外被访问到，并且对象是聚合量，编译器可以不创建这个对象，直接创建它的成员变量来代替。

**synchronized 和 volatile 构造 happen-before 关系；Thread.start() 和 Thread.join() 方法形成 happen-before 关系。**

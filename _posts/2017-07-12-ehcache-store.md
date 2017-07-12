---
layout: post
title: Ehcache（二）存储层次
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Ehcache 存储层次
---

## 一、存储层级
1. 内存存储：在`堆内存`里存储。从属于 Java GC。
2. 非堆存储：受限于 `RAM` 的可用空间。
  * 不从属于 Java GC。
  * 只能存储**序列化**的数据。
  * 为内存存储提供了溢出能力。
3. 磁盘存储。
  * 备份内存存储。
  * 为非堆存储提供溢出能力。
  * 只能存储**序列化**的数据。

## 二、详细介绍
1. 内存存储：在堆内存分配空间。在不引起 GC 停顿的前提下，尽可能分配空间。利用`非堆内存`存储溢出的数据（为了不引起 GC 停顿）。
* 速度是`最快`的。
* 接受所有数据，无论有没有实现 `Serializable`。
* `线程安全`。
* 如果数据量超过了存储最大值：（1）配置了溢出策略，数据可以被保存到其他层级；（2）没有配置，一部分数据被删除。

回收策略：
* LRU（最近最少使用）：**默认策略**。缓存的时间戳`离当前时间最远`的将被回收。
* LFU（最少被使用）：缓存有一个 hit 值，`值最小`的被回收。
* FIFO（先进先出）

---

2. 磁盘存储
* 仅能存储实现了 `Serializable` 接口的数据。其他数据会抛出 `NotSerializableException` 异常。
* 磁盘存储是**可选**的，不一定要配置；如果有多个 CacheManager，也没有必要配置多个磁盘存储路径。

  ---

  有两种磁盘存储选项：
  * localTempSwap：允许缓存存放到磁盘，但重启之后这些**数据就会丢失**。
  * localRestartable：**重启之后数据不会丢失**，会自动加载到内存中。

  ```xml
  <persistence strategy="localTempSwap" />
  ```

  ---

  磁盘存储路径：
  * user.home：用户 `home` 目录。
  * user.dir：用户当前的活动目录。
  * java.io.tmpdir：默认的临时目录。
  * ehcache.disk.store.dir：命令行中指定的系统属性。

  ```xml
  <diskStore path="/path/to/store/data"/>
  ```

  ---

  禁用磁盘存储：不要在文件里配置 `diskStore`。

---
layout: post
title: Ehcache（三）存储空间大小配置
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Ehcache 存储空间大小配置
---


### 1. 内存存储（堆空间）
本地堆空间可用的最大字节数或存储个数。
`maxEntriesLocalHeapmax` 
`BytesLocalHeap`
### 2. 非堆存储
非堆空间可用的最大字节数。
`maxBytesLocalOffHeap`
### 3。 磁盘存储
磁盘可用的最大字节数或存储个数。
`maxEntriesLocalDiskmax` 
`BytesLocalDisk`

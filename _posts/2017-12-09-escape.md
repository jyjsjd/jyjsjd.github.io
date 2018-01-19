---
layout: post
title: 逃逸分析
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: 逃逸分析
---

* 如果一个对象被**多个**线程或方法使用，那么这个对象的指针就发生了*逃逸*。
* 逃逸分析可以减轻 Java 的**同步负载**和**内存堆分配**压力的全局数据流分析算法。
* 分析一个对象的使用范围决定是否要把它分配在**堆**上，如果一个对象未发生逃逸，则直接分配在**栈**上。
* -XX:+DoEscapeAnalysis开启逃逸分析。

[Java 逃逸分析](http://www.importnew.com/27262.html)

---
layout: post
title: 一道 JavaScript 面试题
category: ['JavaScript']
tags: ['JavaScript']
author: 景阳
email: jyjsjd@hotmail.com
description: 一道 JavaScript 面试题
---

#### 题目
以下代码会如何输出：
```javascript
for (var i = 0; i <= 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, i * 1000);
}
```

答案：以每秒一次的频率，输出5个6。

#### 为什么
* 循环的终止条件是 i<=5，因此当 i 等于 6 时循环结束，`setTimeout` 和它的`回调函数`会在循环结束之后执行。
* i 是用 `var` 声明的，是在全局作用域中定义。
* 回调函数共享全局作用域中的 i，闭包的作用域就是全局作用域。

#### 怎么办
为回调函数提供更多的`闭包作用域`。

====

* 立即执行函数（IIFE）为回调函数建立了一个作用域，记录了每个 i 的值：
```javascript
for (var i = 0; i <= 5; i++) {
  (function (j) {
    setTimeout(function() {
      console.log(j);
    }, j * 1000)
  })(i);
}
```

====

* 建立块作用域，`let` 声明了一个作用域被限制在块级中的变量：
```javascript
for (var i = 0; i <= 5; i++) {
  let j = i;
  setTimeout(function () {
    console.log(j);
  }, j * 1000);
}
```

* 或者：
```javascript
for (let i = 0; i <= 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
```

---

title: JavaScript 变量提升
category: ['JavaScript']
tags: ['JavaScript']
author: 景阳
email: jyjsjd@hotmail.com
description: JavaScript 变量提升
---

#### 总结
* 只有`声明`本身会被提升，而赋值或其他运行逻辑会被留在原处。
* 函数声明会被提升，函数表达式不会被提升。
* 函数声明首先被提升，然后才是变量。

----

输出 `2`：
```javascript
a = 2;
var a;
console.log(a);
```

输出 `undefined`：
```javascript
console.log(a);
var a = 2;
```
----

输出 `2`：
```javascript
foo();

function foo() {
  console.log(2);
}
```

抛出 `TypeError` 异常：
```javascript
foo();

var foo = function () {
  //...
}
```

----

输出 `1`：
```javascript
foo();

var foo;

function foo() {
  console.log(1);
}

foo = function () {
  console.log(2);
}
```

尽管 `var foo` 在 `function foo()` 之前，但是函数声明会被提升到普通变量之前，最终代码被引擎理解为：
```javascript
function foo() {
  console.log(1);
}

var foo;

foo();

foo = function () {
  console.log(2);
}
```

如果后面再次调用 `foo()`，函数声明就会被函数表达式 foo 覆盖。

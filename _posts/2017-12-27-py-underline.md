---

title: Python 中的下划线
category: ['Python']
tags: ['Python']
author: 景阳
email: jyjsjd@hotmail.com
description: Python 中的下划线
---

这里讨论的下划线都是用于变量或下划线本身作为变量是的作用，并不涉及*魔术方法*中的下划线。

#### 要忽略的变量
`_` 作为临时变量使用，表示程序并不关心这个变量：
```python
for _ in range(10):
    do_something()
```

#### 单下划线
Python 中作为*惯例*，声明这个变量是*私有*的。在 import 时是有意义的，`from 包名 import * ` 时，不会导入这些变量。

#### 双下划线
Python 的 `Name Mangling` 技术，为了防止和子类的同名成员发生冲突。

成员有两个前下划线，并且有不多于一个后下划线，在运行时会变为 `_classname__成员名`。

#### 前后双下划线
是在 Python 中有特殊含义的成员。

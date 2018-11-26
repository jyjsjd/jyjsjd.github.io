---

title: 双亲委派模型
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: 双亲委派模型
---

#### 1、类的加载过程
`类的加载过程`指通过一个类的`全限定名`获取描述此类的`二进制字节流`，并将其转化为`方法区`的数据结构，进而生成一个 `java.lang.Class` 对象的`实例`作为方法区各种数据访问的入口。

它使得 Java 类可以被动态加载到 JVM 中并执行。

#### 2、类加载器
类加载器（class loader）用来加载 Java 类到 JVM 中。

ClassLoader 分为`引导类加载器`和其他应用开发人员编写的加载器。
* 引导类加载器（bootstrap class loader）：加载 Java 的`核心库`，是由 `native` 代码实现，并不继承自 java.lang.ClassLoader。
* 扩展类加载器（extensions class loader）：加载 Java 的扩展库。JVM 的实现会提供一个扩展库目录，该加载器在目录里查找并加载类。
* 系统类加载器（system class loader）：根据 Java 应用的`类路径`（Classpath）加载 Java 类。Java 应用的类都是由它完成加载，可以通过 `ClassLoader.getSystemClassLoader()` 获取。

除了引导类加载器外，所有的类加载器都有一个`父类加载器`。

![classloader](/assets/img/classloader.png)

#### 3、双亲委派模型
##### 工作的过程
双亲委派模型工作的过程：如果一个类加载器收到类加载的请求，它首先不会自己去尝试加载这个类，而是把这个请求委托给父类加载器完成。只有当父类加载器在自己的搜索范围内找不到指定类时，子类加载器才会尝试自己取加载。

##### 为什么这么做
判断两个 Java 类是否相同需要：（1）`全限定名相同`；（2）加载类的`类加载器必须相同`。

双亲委派模型确保了核心库都是由引导类加载器加载的。保证了 Java 核心库的类型安全，保证 Java 应用使用的都是同一版本的 Java 核心库的类。

#### 4、加载类的过程
双亲委派模型意味着真正完成类加载工作的类加载器和启动这个加载过程的加载器有可能不是一个。
* 真正完成类加载工作是调用 `defineClass()` 实现的，称为`类的定义加载器（defining loader）`，会抛出 `java.lang.NoClassDefFoundError` 异常；
* 启动类加载过程是通过调用 `loadClass()` 实现的，称为`初始加载器（initiating loader）`，会抛出 `java.lang.ClassNotFoundException `异常。

判断两个类是否相同的时候用的是`类的定义加载器`，也就是说哪个加载器启动类的加载过程不重要，重要的是最终定义这个类的加载器。

![loadclass](/assets/img/loadclass.png)

#### 5、参考
[双亲委派模型与自定义类加载器](http://www.importnew.com/24036.html)

[深入探讨 Java 类加载器](https://www.ibm.com/developerworks/cn/java/j-lo-classloader/)

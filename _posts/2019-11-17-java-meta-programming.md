---
title: Java元编程和热更新技术总结
category: ['Java']
tags: ['Java']
author: jyjsjd
email: jyjsjd@hotmail.com
description: 元编程

---

* TOC
{:toc}

# 元编程

> 元编程则是能生成代码的代码。

它能在编译时或运行时加入自定义功能，赋予程序更多的灵活性。在我的概念中，Java中的元编程很大程度上属于*模板模式*。

## 自省

自省使代码有了解自身结构的能力，能够在特定的位置访问代码中的属性或者方法。

### 反射

Java的反射功能主要在`java.lang.refelet`包，`Class`在`java.lang`包。

反射把Java的类、方法和属性等代码的组成元素抽象为类，让程序人员可以直接操纵代码组成元素，而不是操作类本身。

![Class](/assets/img/Class.png)

### 动态代理

实现在`java.lang.refelet`包。动态代理让代码在运行时选择一个合适的实现来完成任务。[参见]([https://jyjsjd.github.io/java/hook-aspect-proxy/#%E5%8A%A8%E6%80%81%E4%BB%A3%E7%90%86](https://jyjsjd.github.io/java/hook-aspect-proxy/#动态代理))。

### Bean描述符

实现在`java.lang.beans`包。

能够以描述符的方式解构按照Java Bean规范写的POJO。很多地方类似于反射，但仅限于Bean。

### MethodHandle

实现在`java.lang.invoke`包。

是Java对*动态语言*的支持。JVM层面是*invokedynamic*命令。

#### MethodType

#### MethodHandle

方法链接使用的是*signature polymorphism*而不是*type descriptor*。

调用方法在JVM层面的支持是*invokevirtual*命令；常量池增加了3中类型：*CONSTANT_MethodHandle_info*，*CONSTANT_MethodType_info*和*CONSTANT_InvokeDynamic_info*。

#### MethodHandles.Lookup

- findStatic：invokestatic
- findVirtual：invokevirtual&invokeinterface
- findSpecial：invokespecial

### 函数式接口

![Function](/assets/img/Function.png)

可以把函数方法作为参数传递，使Java获得了一些动态语言特性。在JVM层面的支持是*invokevirtual*命令。

![function_interface](/assets/img/function_interface.png)

---

## 编译时

### Annotation Processing

实现在`javax.annotation`和`javax.lang.model`。是`javac`的一个工具，能在**编译时**扫描和处理注解，会启动一个单独的`JVM`环境来执。Java提供了一个抽象实现：

```java
public abstract class AbstractProcessor implements Processor {
    /**
     * 返回Elements, Types和Filer等工具类。
     */
    public synchronized void init(ProcessingEnvironment env) {
    }

    /**
     * 注解处理器处理主要逻辑的方法。
     */
    public boolean process(Set<? extends TypeElement> annoations, RoundEnvironment env) {
    }

    /**
     * 返回注解处理器支持的注解。
     * 
     * @return
     */
    public Set<String> getSupportedAnnotationTypes() {
    }

    /**
     * 返回支持的Java版本。
     */
    public SourceVersion getSupportedSourceVersion() {
    }
}
```

`javax.lang.model`包含把Java源码解构为一系列*元素*、或把一系列*元素*组装为Java源码的的功能，是专门为`Annotation Processing`服务的，类似于*反射*。

![Element](/assets/img/Element.png)

---

## 加载时

### Instrumentation

### 修改字节码

### SPI

---

# 热更新

## JMX

## Agent

## Attach

---

# 总结

> 为什么元编程和热更新要放在一起总结？

我个人认为这两件事对于Java来说都属于“魔法”了，赋予了Java一些动态语言的特性，在日常的编码中很少会使用到这些技术。

# 参考

[深入理解Java虚拟机]()

[Package java.lang.invoke](https://docs.oracle.com/javase/7/docs/api/java/lang/invoke/package-summary.html)

[Annotation Processing101](http://hannesdorfmann.com/annotation-processing/annotationprocessing101)
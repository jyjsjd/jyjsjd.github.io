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

---

### 动态代理

实现在`java.lang.refelet`包。动态代理让代码在运行时选择一个合适的实现来完成任务。

[参见]([https://jyjsjd.github.io/java/hook-aspect-proxy/#%E5%8A%A8%E6%80%81%E4%BB%A3%E7%90%86](https://jyjsjd.github.io/java/hook-aspect-proxy/#动态代理))。

---

### Bean描述符

实现在`java.lang.beans`包。

能够以描述符的方式解构按照Java Bean规范写的POJO。很多地方类似于反射，但仅限于Bean。

---

### Method Handle

实现在`java.lang.invoke`包。在JVM层面的支持是*invokevirtual*命令；常量池增加了3中类型：*CONSTANT_MethodHandle_info*，*CONSTANT_MethodType_info*和*CONSTANT_InvokeDynamic_info*。MethodHandle使用的是*signature polymorphism*而不是*type descriptor*。

#### MethodType

构造MethodType时要提供要调用方法的参数列表和返回类型，以供MethodHandle使用。通常MethodType是由静态方法构造，它的两个私有构造方法要求提供返回参数和参数列表。

> A MethodType represents the arguments and return type accepted and returned by a method handle or passed and expected by a method handle caller.

```java
public final class MethodType implements java.io.Serializable {
    private MethodType(Class<?> rtype, Class<?>[] ptypes, boolean trusted) {
        checkRtype(rtype);
        checkPtypes(ptypes);
        this.rtype = rtype;
        this.ptypes = trusted ? ptypes : Arrays.copyOf(ptypes, ptypes.length);
    }

    private MethodType(Class<?>[] ptypes, Class<?> rtype) {
        this.rtype = rtype;
        this.ptypes = ptypes;
    }
}
```

#### MethodHandle

MethodHandle是对底层可执行方法的引用，有了MethodType就可以获取MethodHandle。

> Method handles are dynamically and strongly typed according to their parameter and return types. They are not distinguished by the name or the defining class of their underlying methods.

触发方法时可以调用以下几个方法：

- invoke：会尝试在调用的时候进行返回值和参数类型的转换。
- invokeExact：和invoke不同在于类型必须要完全一致，参数列表和返回类型不可以有转型。
- invokeWithArguments

也可以绑定到具体对象上去执行：

- bindTo

#### MethodHandles.Lookup

工具类，以下方法可以获得MethodHandle，各自对应了JVM命令：

- findStatic：invokestatic
- findVirtual：invokevirtual&invokeinterface
- findSpecial：invokespecial

![lookup](/assets/img/lookup.png)

---

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

实现在`java.lang.instrument`。

> Provides services that allow Java programming language agents to instrument programs running on the JVM.

Instrumentation的具体实现依赖于`JVMTI`。Java Virtual Machine Tool Interface（JVMTI）是一套由 Java 虚拟机提供的，为 JVM 相关的工具提供的本地编程接口集合。可以在命令行启动时加入以下参数：

```shell
-javaagent:jarpath[=options]
```

JAR文件中的`manifest`必须要包含实现了`premain`方法的类；或者是包含`agentmain`方法的类。比如：

```
Manifest-Version: 1.0 
Premain-Class: Premain
```

或者：

```
Manifest-Version: 1.0 
Agentmain-Class: Agentmain
```

#### premain

在JVM启动之后，premain会在main方法之前被调用，JVM会按照以下顺序查找：

```java
public static void premain(String agentArgs, Instrumentation inst);
public static void premain(String agentArgs);
```

如果有第一个premain方法就不会尝试调用第二个方法。

#### agentmain

agentmain方法可以在main方法执行之后运行，同样JVM会按照以下顺序查找：

```java
public static void agentmain (String agentArgs, Instrumentation inst);
public static void agentmain (String agentArgs); 
```

---

### 修改字节码

比较常用的就是Spring的AOP了。

![AnnotationAwareAspectJAutoProxyCreator](/assets/img/AnnotationAwareAspectJAutoProxyCreator.png)

从上图可见，注解方式依赖的`AnnotationAwareAspectJAutoProxyCreator`是继承自`BeanPostProcessor`，AOP最终就是在`postProcessAfterInitialization`方法中实现的。

Spring实现AOP使用两种策略：

- JDK的动态代理；
- CGLIB。

分别对应`JdkDynamicAopProxy`和`ObjenesisCglibAopProxy`。

---

### SPI

实现在`java.util.ServiceLoader`。

**面向接口编程**的一个典型案例，分为接口`service`和接口的实现`service provider`。使用者可以根据不同的需要使用`service provider`，只要它实现了`service`即可，通过在`META-INF/services`目录中写入用实现类的全限定名命名的**文件**，告诉程序具体的实现类，通过`ServiceLoader`去加载：

```
com.xxx.service.ServiceProvider
```

在`ServiceLoader`中可见调用`load`方法寻找实现类时，它直接去`META-INF/services`目录：

```java
public final class ServiceLoader<S> implements Iterable<S> {
    private static final String PREFIX = "META-INF/services/";
}
```

在Java中比较常见的应用是SQL的`DriverManager`中加载数据库驱动的代码，可以看到它是通过`ServiceLoader`去找数据库的驱动程序：

```java
public class DriverManager {
    // ...
    static {
        loadInitialDrivers();
        println("JDBC DriverManager initialized");
    }

    // ...
    private static void loadInitialDrivers() {
        // ...
        AccessController.doPrivileged(new PrivilegedAction<Void>() {
            public Void run() {
                ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class);
                Iterator<Driver> driversIterator = loadedDrivers.iterator();

                try{
                    while(driversIterator.hasNext()) {
                        driversIterator.next();
                    }
                } catch(Throwable t) {
                }
                return null;
            }
        });
    // ...
}
```



Spring Boot的自动配置采用了类似的策略：[Understanding Auto-configured Beans](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-understanding-auto-configured-beans)。

---

# 热更新

## JMX

实现在 `java.lang.management`和 `javax.management`包。

![JMX](/assets/img/JMX.gif)

如上图所示，JMX分为3个层次：

### Instrumentation

> An MBean is a managed Java object, similar to a JavaBeans component, that follows the design patterns set forth in the JMX specification. An MBean can represent a device, an application, or any resource that needs to be managed. 

MBean，被管理的资源。JMX定义了5中MBean：

| 类型           | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| Standard MBean | 由MBean接口（接口命名以MBean结尾）和实现组成。管理的资源定义在接口中，类似于Java Bean。 |
| Dynamic MBean  | 实现`javax.management.DynamicMBean`接口，所有属性、方法都在运行时决定。 |
| Open MBean     |                                                              |
| Model MBean    |                                                              |
| MXBean         |                                                              |



### JMX Agent

MBeanServer，提供对资源的注册和管理。

### Remote Management

提供远程访问的入口。

jconsole

HtmlAdaptorServer

RMI

---

## Agent

---

## Attach

---

# 总结

> 为什么元编程和热更新要放在一起总结？

我个人认为这两件事对于Java来说都属于“魔法”了，赋予了Java一些动态语言的特性，在日常的编码中很少会使用到这些技术。

---

# 参考文献

[深入理解Java虚拟机]()

[Package java.lang.invoke](https://docs.oracle.com/javase/7/docs/api/java/lang/invoke/package-summary.html)

[Package java.lang.instrument](https://docs.oracle.com/javase/7/docs/api/java/lang/instrument/package-summary.html)

[Annotation Processing101](http://hannesdorfmann.com/annotation-processing/annotationprocessing101)

[Instrumentation 新功能](https://www.ibm.com/developerworks/cn/java/j-lo-jse61/index.html)

[Understanding Auto-configured Beans](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-understanding-auto-configured-beans)

[Java SPI思想梳理](https://zhuanlan.zhihu.com/p/28909673)

[Spring AOP 使用介绍，从前世到今生](https://www.javadoop.com/post/spring-aop-intro)

[Spring AOP 源码解析](https://javadoop.com/post/spring-aop-source)

[JMX超详细解读](https://www.cnblogs.com/dongguacai/p/5900507.html)

[Getting Started with Java Management Extensions (JMX): Developing Management and Monitoring Solutions](https://www.oracle.com/technical-resources/articles/javase/jmx.html)
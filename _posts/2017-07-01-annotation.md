---

title: Java 注解笔记
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Java 注解笔记
---

## 一、前言
一直都没有搞懂注解的原理，只知道用，开这个笔记记录注解的基本知识点。

## 二、元注解
元注解是用来注解其他注解的注解。有4种：

### 1、@Target 表示注解可以用于什么地方。ElementType 包含：
  * CONSTRUCTOR：`构造器`声明。
  * FIELD：`域`声明。包括枚举。
  * LOCAL_VARIABLE：`局部变量`声明。
  * METHOD：`方法`声明。
  * PACKAGE：`包`声明。
  * PARAMETER：`参数`声明。
  * TYPE：类、接口或枚举声明。

### 2、@Retention 表示需要在什么级别保存该注解。RetentionPolicy 包括：
  * SOURCE：注解将被编译器抛弃。
  * CLASS：注解在 class 文件中可用，将被虚拟机抛弃。
  * RUNTIME：在运行时也保留注解。

### 3、@Documented 表示注解包含在 JavaDoc 中。

### 4、@Inherit 表示允许子类`继承`父类的注解 -- 但**注解不支持继承（extends）**。

## 三、注解的定义
定义注解就像定义一个接口：
```java 
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UseCase {
  public int id();
  public String description() default "";
}
```

* 关键字 `@interface`，注解最后也会被编译成 `class` 文件。
* 注解的元素在定义中表现为`公有方法`。
* 注解的元素可以有`默认值`，用关键字 `default` 打头 -- 这也是和接口不一样的地方。
* **可以将一个注解作为另一个注解的元素**。 以下模拟 ORM 对数据表字段的定义：

```java
@Target(ElementType.FIELD)
@Retention(RetentionType.RUNTIME)
public @interface Constraints {
  boolean primaryKey() default false;
  boolean allowNull() default false;
  boolean unique() default false;
}

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SQLColumn {
  int value() default 0;
  String name() default "";
  Constraints constraints() default @Constraints
}
```
* 元素不能有不确定的值，即要么存在默认值，要么就在使用注解时给元素赋值。

## 四、使用注解的信息
### 1、反射机制：Class、Method、Field 上都有获得注解的方法。
仍然以一开头定义的注解为例，要获得某 Class 上的注解：

```java
public static void trackUseCases(Class <?> cl) {
  for (Method m: cl.getDeclaredMethods()) {
    UseCase uc = m.getAnnotation(UseCase.class);

    if (uc != null) {
      System.out.println("Found use case: " + uc.id() + " " + uc.description());
    }
  }
}
```

### 2、Java 提供的 apt 工具。

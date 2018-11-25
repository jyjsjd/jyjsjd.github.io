---

title: Spring 工厂方法与 FactoryBean
category: ['Spring']
tags: ['Spring']
author: 景阳
email: jyjsjd@hotmail.com
description: Spring 工厂方法与 FactoryBean
---


#### 1、静态工厂方法
##### （1）无参
有如下静态方法：

```java
public class StaticBarInterfaceFactory {
  public static BarInterface getInstance() {
    return new BarInterfaceImpl();
  }
}
```

`class` 代表静态工厂类，`factory-method` 指定静态工厂方法。容器调用指定静态工厂类的方法，返回调用结果。

```xml
<bean id="foo" class="...Foo"> 
  <property name="barInterface"> 
    <ref bean="bar"/> 
  </property> 
</bean>

<bean id="bar" class="...StaticBarInterfaceFactory" factory-method="getInstance"/>
```

##### （2）有参
有如下静态工厂方法，带有一个参数：

```java
public class StaticBarInterfaceFactory { 
  public static BarInterface getInstance(Foobar foobar) { 
    return new BarInterfaceImpl(foobar); 
  }
}
```

用 `constructor-arg` 为静态工厂方法传入参数：

```xml
<bean id="foo" class="...Foo"> 
  <property name="barInterface"> 
    <ref bean="bar"/> 
  </property> 
</bean>

<bean id="bar" class="...StaticBarInterfaceFactory" factory-method="getInstance"> 
  <constructor-arg> 
    <ref bean="foobar"/> 
  </constructor-arg> 
</bean>
```

#### 2、非静态工厂方法
现有非静态工厂方法：

```java
public class NonStaticBarInterfaceFactory { 
  public BarInterface getInstance() { 
    return new BarInterfaceImpl(); 
  } 
}
```

与静态工厂方法不同的是，调用 `factory-method` 的工厂类 `factory-bean` 是一个实例：

```xml
<bean id="foo" class="...Foo"> 
  <property name="barInterface"> 
    <ref bean="bar"/> 
  </property> 
</bean>

<bean id="barFactory" class="...NonStaticBarInterfaceFactory"/>

<bean id="bar" factory-bean="barFactory" factory-method="getInstance"/>
```

#### 3、FactoryBean
FactoryBean 是 Spring 提供的一种可供扩展容器实例化逻辑的接口，定义如下：

```java
public interface FactoryBean {
  T getObject() throws Exception; // 实现实例化对象逻辑
  Class<?> getObjectType(); // 返回对象类型
  boolean isSingleton(); // 是否 singleton
}
```

```xml
<bean id="useFactoryBeanImpl" class="...UseFactoryBeanImpl"> 
  <property name="someBean"> <ref bean="factoryBeanImpl"/> </property> 
</bean>

<bean id="factoryBeanImpl" class="...FactoryBeanImpl" />
```

在 `useFactoryBeanImpl` 中依赖的 `someBean` 是 `FactoryBeanImpl`（实现了 `FactoryBean`），但实际上的类型应该是实现 FactoryBean 的类在 `getObject()` 方法返回的类型。

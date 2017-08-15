---
layout: post
title: Spring MVC 配置文件
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Spring MVC 配置文件
---

## 前言
一直没弄明白 Spring MVC 中几个配置文件的关系，在这里梳理一下。

## Spring MVC 配置

### 一、web.xml
DispatcherServlet 是整个框架的前端控制器，它是一个 Servlet，继承 HttpServlet。要告诉 DispatcherServlet 哪些请求需要它进行处理。

1. 用 Java 代码配置 Spring

```java
public class MyWebApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) {
        ServletRegistration.Dynamic registration = container.addServlet("example", new DispatcherServlet());
        registration.setLoadOnStartup(1);
        registration.addMapping("/example/*");
    }
}
```

WebApplicationInitializer 是一个接口，能（1）初始化 Servlet 3 容器和（2）自动发现代码配置。

2. XML 配置（相当于以上 Java 代码）

```xml
<web-app>
    <servlet>
        <servlet-name>example</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>example</servlet-name>
        <url-pattern>/example/*</url-pattern>
    </servlet-mapping>
</web-app>
```

DispatcherServlet 转发请求之后的处理：
* HandlerMapping：处理请求和具体的控制类之间的映射关系。当请求到达 DispatcherServlet 之后，它去寻找具体的 HanderMapping 实例，获得对应当前请求的具体处理类 Controller。
* Controller：是对应 DispatcherServlet 的次级控制器，它对应某个具体请求的处理逻辑。

DispatcherServlet 拥有自己的 WebApplicationContext，它继承了所有根 WebApplicationContext 中的 bean。这些继承而来的 bean 可以被 Servlet 生命周期中的 bean 覆盖。

WebApplicationContext 不同于 ApplicationContext，它是 ApplicationContext 的扩展：
* 有解析 theme 的能力；
* 知道自己联系那个 Servlet。

### 二、[servlet-name]-servlet.xml
DispatcherServlet 初始化之后，Spring MVC 会在 `WEB-INF` 目录中找名为 **[servlet-name]-servlet.xml** 的配置文件，初始化其中的 bean；在这个配置文件中的 bean 会覆盖全局中的**同名** bean。

![mvc-context.png](/assets/img/mvc-context.png)


实际上，也可以只存在 root 上下文，可以在 servlet **init-param** 参数中配置一个**空的** contextConfigLocation。
```xml
<web-app>
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/root-context.xml</param-value>
    </context-param>
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value></param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
</web-app>
```

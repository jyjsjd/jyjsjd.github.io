---

title: 有关 RequestMapping 注解的一些事（三）
category: ['Spring']
tags: ['Spring']
author: 景阳
email: jyjsjd@hotmail.com
description: 有关 RequestMapping 注解的一些事
---

实际使用中可以发现 `@RequestMapping` 注解的方法能接受各种各样的参数，本文梳理一下它能接受的参数。

#### 1、request 或者 response（Servlet API）
可以是任意 request 或者 response 类型，比如 ServletRequest、HttpServletResponse。

#### 2、session（Servlet API）
实现了 `HTTPSession` 的类型。这种类型的参数必须对应一个存在的 session，所以它**不能**为 null。

#### 3、Spring 包中的 WebRequest 或 NativeWebRequest
它们提供了方法访问普通的请求参数（request parameter）和 request/session 属性（attribute）。

#### 4、java.util.Locale
当前请求的语言设置（locale）；LocaleResolver / LocaleContextResolver 配置了语言信息。

#### 5、java.util.TimeZone (Java 6+) / java.time.ZoneId (Java 8)
当前请求的时区信息；LocaleContextResolver 配置了时区信息。

#### 6、java.io.InputStream / java.io.Reader
它们可以访问请求的内容。

#### 7、java.io.OutputStream / java.io.Writer
它们用来生成响应的内容。

#### 8、org.springframework.http.HttpMethod
请求方法。

#### 9、java.security.Principal
当前的已登录用户。

#### 10、java.util.Map / org.springframework.ui.Model / org.springframework.ui.ModelMap
暴露给网页视图（view） 使用的隐式模型（model）。

#### 11、org.springframework.validation.Errors / org.springframework.validation.BindingResult
前置方法（preceding command）的验证结果（validation result）。

#### 12、org.springframework.web.servlet.mvc.support.RedirectAttributes
在跳转（redirect）中使用的参数。

#### 13、HttpEntity<?>
整个请求包含请求头和请求体。

#### 14、org.springframework.web.bind.support.SessionStatus

#### 15、org.springframework.web.util.UriComponentsBuilder
以上两个不太明白，英文也读不太懂...

#### 16、其他参数注解
* @PathVariable：URI 路径参数。
* @MatrixVariable：URI 路径中的键值对参数。
* @RequestParam：查询参数。
* @RequestHeader：请求头（request header）参数。
* @RequestPart：请求体中的 `multipart/form-data` 部分。
* @RequestBody：请求体（request body）参数，用 `HttpMessageConverters` 转换。
* @SessionAttribute：`session` 的属性参数。
* @RequestAttribute：请求属性（request attributes）。

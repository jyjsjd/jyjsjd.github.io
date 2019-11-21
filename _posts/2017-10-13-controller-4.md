---

title: 有关 RequestMapping 注解的一些事（四）
category: ['Spring']
tags: ['Spring']
author: jyjsjd
email: jyjsjd@hotmail.com
description: 有关 RequestMapping 注解的一些事
---

本文梳理一下 `@RequestMapping` 注解的方法支持的返回值类型。

#### 1、ModelAndView
包含了 model 和 view。

#### 2、Model
视图的名称由 `RequestToViewNameTranslator` 隐式地决定。

#### 3、Map
和 `Model` 一样。

#### 4、View
视图的名称。

#### 5、String
逻辑视图名称。

#### 6、void
响应由方法自行决定（直接向响应体中写入内容）；或者视图由 `RequestToViewNameTranslator` 隐式决定。

#### 7、HttpEntity<?> / ResponseEntity<?>
返回的是整个响应头和响应体（response headers and contents）。

#### 8、HttpHeaders
返回只有响应头的响应。

#### 9、Callable<?>
异步响应。

#### 10、DeferredResult<?>
when the application wants to produce the return value from a thread of its own choosing.

#### 11、ResponseBodyEmitter 
向响应体异步地写入多个对象。

#### 12、SseEmitter 
can be returned to write Server-Sent Events to the response asynchronously; also supported as the body within a ResponseEntity.

#### 13、StreamingResponseBody 
can be returned to write to the response OutputStream asynchronously; also supported as the body within a ResponseEntity.

#### 14、带有 @ResponseBody 注解的方法
返回的内容会被写入响应体（response body）。

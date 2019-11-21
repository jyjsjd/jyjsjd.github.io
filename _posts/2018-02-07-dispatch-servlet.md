---

title: SpringMVC 核心架构
category: ['Java']
tags: ['Java']
author: jyjsjd
email: jyjsjd@hotmail.com
description: SpringMVC 核心架构
---

![dispatch](/assets/img/dispatch.png)

----

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
  HttpServletRequest processedRequest = request;
  HandlerExecutionChain mappedHandler = null;
  boolean multipartRequestParsed = false;

  // 处理异步请求的中心类
  WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

  try {
    ModelAndView mv = null;
    Exception dispatchException = null;

    try {
      // 检查请求是否为 multipart，如果是将通过 MultipartResolver 解析
      processedRequest = checkMultipart(request);
      multipartRequestParsed = (processedRequest != request);

      // 步骤2：获得当前请求的 HandlerExecutionChain
      mappedHandler = getHandler(processedRequest);
      if (mappedHandler == null || mappedHandler.getHandler() == null) {
        noHandlerFound(processedRequest, response);
        return;
      }

      // 步骤3：获得当前请求的 HandlerAdapter，将 Handler 包装成适配器
      HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

      // 处理 last-modified 请求头
      String method = request.getMethod();
      boolean isGet = "GET".equals(method);
      if (isGet || "HEAD".equals(method)) {
        long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
        if (logger.isDebugEnabled()) {
          logger.debug("Last-Modified value for [" + getRequestUri(request) + "] is: " + lastModified);
        }
        if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
          return;
        }
      }

      // 调用拦截器 preHandler 方法
      if (!mappedHandler.applyPreHandle(processedRequest, response)) {
        return;
      }

      // 步骤4：真正调用 Handler 处理请求
      mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

      if (asyncManager.isConcurrentHandlingStarted()) {
        return;
      }

      applyDefaultViewName(processedRequest, mv);
      
      // 调用拦截器 postHandler 方法
      mappedHandler.applyPostHandle(processedRequest, response, mv);
    }
    catch (Exception ex) {
      dispatchException = ex;
    }
    catch (Throwable err) {
      // As of 4.3, we're processing Errors thrown from handler methods as well,
      // making them available for @ExceptionHandler methods and other scenarios.
      dispatchException = new NestedServletException("Handler dispatch failed", err);
    }

    // 步骤5、6：解析视图、渲染视图
    processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
  }
  catch (Exception ex) {
    triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
  }
  catch (Throwable err) {
    triggerAfterCompletion(processedRequest, response, mappedHandler,
        new NestedServletException("Handler processing failed", err));
  }
  finally {
    if (asyncManager.isConcurrentHandlingStarted()) {
      // Instead of postHandle and afterCompletion
      if (mappedHandler != null) {
        mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
      }
    }
    else {
      // Clean up any resources used by a multipart request.
      if (multipartRequestParsed) {
        cleanupMultipart(processedRequest);
      }
    }
  }
}
```

1. 用户发送请求--->DispatcherServlet，前端控制器收到请求后自己不处理，而是委托给其他解析器处理，自己作为统一访问点，进行全局控制。

2. DispatcherServlet--->HandlerMapping，HandlerMapping 会把请求映射为 `HandlerExecutionChain（包含一个Handler 和多个拦截器）`。
```java
public class HandlerExecutionChain {
  private final Object handler;
  private HandlerInterceptor[] interceptors;
  private List<HandlerInterceptor> interceptorList;
    
    ...
}
```

3. DispatcherServlet--->HandlerAdapter，HandlerAdapter 会把处理器 `Handler` 包装为适配器，从而支持多种类型的处理器。

4. HandlerAdapter--->调用真正的 Handler 方法（handle），并返回一个 `ModelAndView` 对象。

5. ModelAndView的`逻辑视图名`--->ViewResolver， `ViewResolver` 将把逻辑视图名解析为具体的 `View`。

6. View--->渲染，View 会根据传进来的 Model 模型数据进行渲染，此处的 Model 实际是一个 Map 数据结构。

----

`<mvc:default-servlet-handler/>`：Spring MVC上下文中定义一个org.springframework.web.servlet.resource.DefaultServletHttpRequestHandler，它会像一个检查员，对进入DispatcherServlet的URL进行筛查，如果发现是静态资源的请求，就将该请求转由Web应用服务器默认的Servlet处理，如果不是静态资源的请求，才由DispatcherServlet继续处理。

一般Web应用服务器默认的Servlet名称是"default"，因此DefaultServletHttpRequestHandler可以找到它。如果你所有的Web应用服务器的默认Servlet名称不是"default"，则需要通过default-servlet-name属性显示指定。

`<mvc:resources />`：允许静态资源放在任何地方，通过location属性指定静态资源的位置；可以通过cacheSeconds属性指定静态资源在浏览器端的缓存时间。

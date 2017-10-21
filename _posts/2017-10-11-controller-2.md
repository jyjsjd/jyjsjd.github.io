---
layout: post
title: 有关 RequestMapping 注解的一些事（二）
category: ['Spring']
tags: ['Spring']
author: 景阳
email: jyjsjd@hotmail.com
description: 有关 RequestMapping 注解的一些事
---

### 5、Consumable Media Types
可以在 Mapping 中加入 `consumes` 条件来声明 Controller 可以被接受的`媒体类型`（media type）—— 也就是首部中的 `Content-Type`：

```java
@PostMapping(path = "/pets", consumes = "application/json") 
public void addPet(@RequestBody Pet pet, Model model) { 
  // implementation omitted 
}
```

注意：
**方法级**上的 consumes 条件会`覆盖`类级别上的 consumes 条件。

### 6、Producible Media Types
可以在 Mapping 中加入 produces 条件声明 Controller 生成的媒体类型 —— 只有首部中的 Accept 符合条件的才会被映射：

```java
@GetMapping(path = "/pets/{petId}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE) 
@ResponseBody 
public Pet getPet(@PathVariable String petId, Model model) { 
  // implementation omitted 
}
```

### 7、请求参数和首部
可以在 @RequestMapping 中加入`请求参数`（params）来缩小请求的匹配范围：

```java
@Controller 
@RequestMapping("/owners/{ownerId}") 
public class RelativePathUriTemplateController {
  @GetMapping(path = "/pets/{petId}", params = "myParam=myValue") 
  public void findPet(@PathVariable String ownerId, @PathVariable String petId, Model model) { 
    // implementation omitted 
  }
}
```

同样，可以在 @RequestMapping 中加入`首部`（headers）来缩小请求的匹配范围：

```java
@Controller 
@RequestMapping("/owners/{ownerId}") 
public class RelativePathUriTemplateController {
  @GetMapping(path = "/pets", headers = "myHeader=myValue") 
  public void findPet(@PathVariable String ownerId, @PathVariable String petId, Model model) { 
    // implementation omitted 
  }
}
```

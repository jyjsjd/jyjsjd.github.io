---

title: 有关 RequestMapping 注解的一些事（一）
category: ['Spring']
tags: ['Spring']
author: 景阳
email: jyjsjd@hotmail.com
description: 有关 RequestMapping 注解的一些事
---

### 1、同一 URI 对应不同 Http 方法
@RequestMapping 可以使用在类级别上，在类中用 `@GetMapping`、`@PostMapping` 等注解的方法会映射到统一 URL，并对应各自的方法：

```java
@Controller
@RequestMapping("/appointments")
public class AppointmentsController {

  @GetMapping
  public Map get() {
    // content
  }

  @GetMapping("/{day}")
  public Map getForDay() {
    // content
  }

  @PostMapping
  public String add() {
    // content
  }
}
```
### 2、路径参数
URL 上可以带`参数`，并且可以有`多个`参数：

```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class RelativePathUriTemplateController {
  @RequestMapping("/pets/{petId}") public void findPet(@PathVariable String ownerId, @PathVariable String petId, Model model) {
    // content
  }
}
```

### 3、URL 与 正则表达式
URL 上可以使用`正则表达式`：

```java
@RequestMapping("/web//{module:.+}/{pageName:.+}") 
public void handle(@PathVariable String module, @PathVariable String pageName) { 
  // content  
}
```

使用正则表达式有几个注意点：
* 一个 URL 匹配**多个** path 时，只有**最具体**的那个会被用到 —— 比如 `/person` 就比 `/**` 具体；
* URL 路径可以带占位符：@RequestMapping 支持 ${…}；
* 后缀匹配：Spring MVC 默认后缀匹配 `*.`，映射到 `/person` 的 `Controller` 也会隐式地映射到 `/person.*`。


### 4、矩阵变量（Matrix Variables）
矩阵变量可以出现在路径的每个部分，每个变量可以用分号`;`或者逗号`,`分隔，如 "/cars;color=red;year=2012"，或者"color=red,green,blue"：

```java
// GET /pets/42;q=11;r=22
@GetMapping("/pets/{petId}") 
public void findPet(@PathVariable String petId, @MatrixVariable int q) {
// petId == 42 // q == 11
}
```

有几个注意点：
* 因为路径的每个部分都可以有矩阵参数，所以在一些情况下要提供具体的**路径参数**加以区别：

  ```java
  // GET /owners/42;q=11/pets/21;q=22
  @GetMapping("/owners/{ownerId}/pets/{petId}") 
  public void findPet(
    @MatrixVariable(name="q", pathVar="ownerId") int q1, @MatrixVariable(name="q", pathVar="petId") int q2) {
    // q1 == 11 // q2 == 22
  }
  ```

* 矩阵参数可以有默认值：

  ```java
  // GET /pets/42
  @GetMapping("/pets/{petId}") 
  public void findPet(@MatrixVariable(required=false, defaultValue="1") int q) {
    // q == 1
  }
  ```

* 矩阵参数可以保存在 `Map` 中：

  ```java
  // GET /owners/42;q=11;r=12/pets/21;q=22;s=23
  @GetMapping("/owners/{ownerId}/pets/{petId}") public void findPet(
    @MatrixVariable MultiValueMap<String, String> matrixVars, 
    @MatrixVariable(pathVar="petId") MultiValueMap<String, String> petMatrixVars) {
    // matrixVars: ["q" : [11,22], "r" : 12, "s" : 23] 
    // petMatrixVars: ["q" : 11, "s" : 23]
  }
  ```

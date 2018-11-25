---

title: Comparable 和 Comparator
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Comparable 接口
---

### Comparable 

```java
public interface Comparable<T> {
    public int compareTo(T o);
}
```

* `compareTo` 方法没有在 Object 中实现，而是 Comparable 接口的唯一方法。
* 实现了该接口，就可以与 Java 平台的`泛型算法`和依赖的于该接口的`集合实现`进行协作。
* `compareTo` 的通用约定和 `equals` 相同：当该对象小于、等于或大于指定对象时，分别返回一个负整数、0或者正整数；当对象和指定对象类型不同时，抛出 `ClassCastException`。
* `compareTo` 方法的等同性测试一定遵守 `equals` 方法的等同性测试的限制条件：自反性、一致性、传递性。如果不遵守这些条件，利用 equals 和 compareTo 方法的集合类型将表现出不同效果。

举例：
BigDecimal 的 equal 和 compareTo 方法表现不一致，如果有一个 HashSet 方法并添加 BigDecimal(1.0) 和BigDecimal(1.00)，这个集合机会包含两个元素，因为通过 equals 方法比较这两个元素是不等的；如果是一个 TreeSet，并添加那两个元素的话，集合只会包含一个元素，因为 compareTo 方法认为他们是相等的。 --- 例子来源于 *Effective Java*


### Comparator

```java
// Java 8 进行了较大的改动
public interface Comparator<T> {
    int compare(T o1, T o2);
}
```
通常应用于*策略模式*，通过传递不同的比较器（实现 Comparator 接口），获得不同的排列顺序。

通常作为匿名类，当做参数传递：
```java
Arrays.sort(stringArray, new Comparator<String>() { 
  public int compare(String s1, String s2) { 
    return s1.length() - s2.length(); 
  } 
});
```

---

title: ThreadLocal
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: ThreadLocal
---

#### ThreadLocal
ThreadLocal 是 Thread 的局部变量，它为每个使用该变量的线程提供独立的变量副本，每个线程都可以独立地改变自己的副本而不会影响其他相差对应的副本。在一个类中，ThreadLocal类型的实例是典型的`私有、静态（private static）`字段，因为我们可以将其作为线程的关联状态。

ThreadLocal 内部使用 ThreadLocalMap 保存数据，它有点像HashMap，可以保存键值对，但是一个ThreadLocal只能保存`一个`，并且各个线程的数据互不干扰。

#### ThreadLocalMap
##### 默认情况
默认数组长度是`16`，默认负载因子`2/3`，超过负载因子就会执行扩容操作，默认扩容为之前容量的`2倍`。
##### 哈希算法
插入 Entry 时从位置0开始，计算哈希值时下一个位置加固定值 `0x61c88647`。

```java
/**
 * The next hash code to be given out. Updated atomically. Starts at
 * zero.
 */
private static AtomicInteger nextHashCode = new AtomicInteger();

/**
 * The difference between successively generated hash codes - turns
 * implicit sequential thread-local IDs into near-optimally spread
 * multiplicative hash values for power-of-two-sized tables.
 */
private static final int HASH_INCREMENT = 0x61c88647;

/**
 * Returns the next hash code.
 */
private static int nextHashCode() {
  return nextHashCode.getAndAdd(HASH_INCREMENT);
}
```

##### 计算在数组中的位置
* 数组存放位置通过 `threadLocalHashCode & (len - 1)` 计算。
* 如果当前位置是空的，就初始化一个Entry对象放在当前位置上；
* 如果位置h已经有Entry对象了，如果这个Entry对象的key正好是即将设置的key，那么重新设置Entry中的value；
* 如果已经存储了对象，那么就往后挪一个位置，依次类推直到找到空的位置；
* 最后还要判断一下当前的存储的对象个数是否已经超出了阈值（threshold）大小，如果超出了，需要重新扩充并将所有的对象重新计算位置（rehash函数来实现）。

```java
private void set(ThreadLocal<?> key, Object value) {
  // We don't use a fast path as with get() because it is at
  // least as common to use set() to create new entries as
  // it is to replace existing ones, in which case, a fast
  // path would fail more often than not.
  Entry[] tab = table;
  int len = tab.length;
  int i = key.threadLocalHashCode & (len - 1);

  for (Entry e = tab[i];
       e != null;
       e = tab[i = nextIndex(i, len)]) {
    ThreadLocal<?> k = e.get();

    if (k == key) {
      e.value = value;
      return;
    }

    if (k == null) {
      replaceStaleEntry(key, value, i);
      return;
    }
  }

  tab[i] = new Entry(key, value);
  int sz = ++size;
  if (!cleanSomeSlots(i, sz) && sz >= threshold)
    rehash();
}
```

#### 参考
* [ThreadLocal原理解析（2）：ThreadLocalMap源码解析](http://blog.csdn.net/huachao1001/article/details/51734973)
* [使用 ThreadLocal 改进你的层次的划分](http://www.importnew.com/27960.html)
* [https://www.jianshu.com/p/377bb840802f](https://www.jianshu.com/p/377bb840802f)
* [使用ThreadLocal变量的时机和方法](http://www.importnew.com/14398.html)

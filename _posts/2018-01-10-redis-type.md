---
layout: post
title: Redis 数据结构和对象
category: ['数据库']
tags: ['数据库']
author: 景阳
email:  jyjsjd@hotmail.com
description: Redis 数据结构和对象
---

## 1、简单动态字符串（Simple Dynamic String，SDS）
### （1）结构
* SDS 遵循 c 字符串以 `'\0'` 结尾的惯例，但是不计算在长度里；
* SDS 记录了自身长度，获取字符串长度复杂度 `O(1)`；

```c
struct {
  int len;    // 已用长度
  int free;   // 未用长度
  char buf[]; //字节数组
}

```

![redis_str.png](/assets/img/redis_str.png)

### （2）减少修改字符串带来的内存重分配次数
* 空间预分配：
  - 如果对 SDS 修改之后的长度`小于` 1MB，那么程序分配和 `len` 属性*同样大小*的未使用空间；
  - 如果`大于` 1MB，程序分配 `1MB` 的未使用空间。
* 惰性空间释放：当 SDS 缩短字符串时，程序并不立即回收多余空间，而是用 `free` 属性记录长度，以待未来使用。

### （3）二进制安全
SDS 的 API 都是二进制安全的，所有 API 都以处理二进制的方式处理存放的数据，程序不会对其中的数据进行任何限制、过滤或者假设，数据在写入时什么样，读取时就是什么样。

## 2、链表
* 双端；
* 无环，头节点的 `prev` 和尾节点的 `next` 都指向 `null`；
* 保存链表长度；
* 多态：可保存不同类型的值。

```c
typedef struct list {
  listNode *head;                    // 头节点
  listNode *tail;                    // 尾节点
  unsigned long len;                 // 链表包含的节点数量
  void *(*dup)(void * ptr);          // 节点复制函数
  void (*free)(void *ptr);           // 节点值释放函数
  int(*match)(void *ptr, void *key); // 节点值对比函数
}

typedef struct listNode {
  struct listNode *prev; // 前置节点
  struct listNode *next; // 后置节点
  void *value;           // 节点的值
}
```

![redis_list.png](/assets/img/redis_list.png)

## 3、字典
### （1）结构
* 哈希表：`table` 属性是一个数组，数组中每个元素都是一个指向 `dictEntry` 结构的指针，每个 dictEntry 结构保存一个`键值对`。

```c
typedef struct dictht {
  dictEntry **table;      // 哈希表数组
  unsigned long size;     // 哈希表大小
  unsigned long sizemask; // 哈希表大小掩码，用于计算索引值，总是等于size-1
  unsigned long used;     // 哈希表已有节点数量
} dictht;
```

* 哈希表节点：
  - key 保存键；
  - v 保存值，值可以是一个`指针`、一个 `uint64_t` 整数或者是一个 `int64_t` 整数；
  - next 指向下一个节点———_解决冲突_。

```c
typedef struct dictEntry {
  void *key; // 键
  union {    // 值
    void *val;
    uint64_tu64;
    int64_ts64; 
  } v;
  struct dictEntry *next; // 指向下个哈希节点，形成链表
} dictEntry;
```

![redis_hash.png](/assets/img/redis_hash.png)

* 字典：
  - ht 属性是包含*两个*项的数组，字典只使用 `ht[0]`，`ht[1]` 只会在对 ht[0] `rehash` 时使用;
  - rehashidx 记录 rehash 的进度，如果没有进行 rehash，它等于 -1。

```c
typedef struct dict {
  dictType *type; // 类型待定函数
  void *privdata; // 私有数据
  dictht ht[2];   // 哈希表
  int rehashidx;  // 标志 rehash 是否进行，当 rehash 不在进行时为-1
} dict;

typedef struct dictType {
  unsigned int (*hashFunction)(const void *key);
  void *(*keyDup)(void *privdata, const void *key);
  void *(*valDup)(void *privdata, const void *obj);
  int (*keyCompare)(void *privdata, const void *key1, const void *key2);
  void (*keyDestructor)(void *privdata, void *key);
  void (*valDestructor)(void *privdata, void *val);
}
```

![redis_dict.png](/assets/img/redis_dict.png)

### （2）哈希算法
* 将一个新的键值对添加到字典时，首先根据`键`计算出`哈希值`和`索引值`，然后再根据`索引值`将包含键值对的节点放到哈希表数组的指定索引上；
* 解决冲突：`链地址法`——多个哈希节点构成一个*单向链表*；为了速度考虑，程序总是将新节点添加到链表的`表头`。

### （3）rehash
#### 执行时机
负载因子 = 哈希表已保存节点数量 / 哈希表大小

哈希表扩展和收缩：
* 扩展
  - 服务器*没有执行* `BGSAVE` 或 `BGREWRITEAOF`，并且负载因子`大于等于 1`；
  - 服务器*正在执行* `BGSAVE` 或 `BGREWRITEAOF`，并且负载因子`大于等于 5`。
* 收缩：负载因子`小于 0.1`。

#### 执行步骤
* 为 ht[1] 分配空间：
  - 扩展：ht[1] 的大小等于_第一个大于等于_ `ht[0].used*2` 的 `2的n次幂`；
  - 收缩：ht[1] 的大小等于_第一个大于等于_ `ht[0].used` 的 `2的n次幂`。
* 将保存在 ht[0] 的所有键值对 rehash 到 ht[1] 上：重新计算`哈希值`和`索引值`；
* 当 ht[0] 的所有键值对都 rehash 到 ht[1] 上之后：
  - 释放 ht[0]；
  - 将 ht[1] 设置为 ht[0]；
  - 为 ht[1] 新建一个空白哈希表。

#### 渐进式 rehash
如果哈希表数量庞大，一次性 rehash 会导致服务器在一段时间内停止服务。为了避免这种情况，redis 分多次、渐进式地把 ht[0] 里的键值对 rehash 到 ht[1]。
* 为 ht[1] 分配空间，字典_同时_持有 ht[0] 和 ht[1]；
* 把 rehashidx 设置为 `0`，表示正在 rehash；
* 在 rehash 过程中对 ht[0] 的操作，都会顺带 rehash 到 ht[1]；
* rehash 完成之后把rehashidx 设置为 `-1`，表示完成。

## 4、跳跃表
* 跳跃表节点：
  - 层：level 数组包含多个元素，每个元素都包含一个指向其他节点的指针；
  - 前进指针：每层都有一个指向表尾方向的前进指针，用于表头向表尾方向访问节点；
  - 跨度：记录两个节点间的距离；
  - 后退指针：用于从表尾向表头方向访问节点。
  - 分值和成员：分值是一个 double 类型的浮点数，跳跃表中的所有节点按照分值大小排序；成员对象是一个指针，指向一个字符串对象。

```c
typedef struct zskiplistNode {
  struct zskiplistLevel { // 层
    struct zskiplistNode *forward; // 前进指针
    unsigned int span;             // 跨度
  } level[];
  struct zskiplistNode *backward;  // 后退指针
  double score;                    // 分值
  robj *obj;                       // 成员对象
} zskiplistNode;
```

* 跳跃表

```c
typedef struct zskiplist {
  struct skiplistNode *header, *tail; // 表头和表尾节点
  unsigned long length;               // 节点数量
  int level;                          // 层数最大的节点层数
} zskiplist;
```

![redis_skiplist.png](/assets/img/redis_skiplist.png)

## 5、整数集合
### （1）结构
* contents 数组是`整数`集合的底层实现————每个元素都是一个数组项，按照值的大小`从小到大`排序，且`不包含重复项`；
* contents 声明为 int8_t 类型，但实际上的类型由 encoding 决定。

```c
typedef struct intset {
  uint32_t encoding; // 编码方式
  uint32_t length;   // 集合包含的元素数量
  int8_t contents[]; // 保存元素的数组
}
```

### （2）升级
当要把一个新元素加入整数集合，且这个元素比现有所有元素的类型都要长时，整数集合必须要升级。

* 根据新元素类型，`扩展`整数集合数组的空间大小，并为新元素分配空间；
* 将底层数组的所有元素都`转换`为与新元素相同的类型；
* 添加新元素。

### （3）降级
不支持降级操作。

## 6、压缩列表
压缩列表是由一系列特殊编码的`连续内存块`组成的`顺序型`数据结构。一个压缩列表可以包含`任意`多个节点，每个节点可以保存一个`字节数组`或者一个`整数值`。

### 节点构成
* 字节数组，可以是以下3种长度：
  - 长度小于等于2<sup>6</sup> - 1字节的字节数组；
  - 长度小于等于2<sup>14</sup> - 1字节的字节数组；
  - 长度小于等于2<sup>32</sup> - 1字节的字节数组。

* 整数值：
  - 4位长，介于0 - 12间的无符号整数；
  - 1字节长的有符号整数；
  - 3字节长的有符号整数
  - int16_t类型整数；
  - int32_t类型整数；
  - int64_t类型整数。

每个压缩节点都由 previous_entry_length、encoding、content 组成：

| --- | --- | --- |
| previous_entry_length | encoding | content |

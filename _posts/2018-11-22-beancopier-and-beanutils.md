---

title: BeanUtils 和 BeanCopier 性能比较
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: BeanUtils 和 BeanCopier 性能比较

---



`BeanUtils` 和 `BeanCopier` 是公司内部用来进行 `DTO`、`Entity` 和 `VO` 属性拷贝的工具类，本文是对他们的实现原理和性能做一个简单比较。

----

`BeanUtils` 是 `Spring` 提供的用于对 `Java Bean` 进行操作的工具，内部是用 `java.beans` 包实现的，主要用到的类有：`BeanInfo`、`PropertyDescriptor` 和 `Introspector`。

它在用于拷贝 `Java Bean` 属性时，会遍历源对象的属性，查看属性是否也存在于目标对象，如果目标对象也有，则会调用属性的`writeMethod`，把值写入目标对象：

```java

for(int var9 = 0; var9 < var8; ++var9) {
            PropertyDescriptor targetPd = var7[var9];
            Method writeMethod = targetPd.getWriteMethod();
            if (writeMethod != null && (ignoreList == null || !ignoreList.contains(targetPd.getName()))) {
                PropertyDescriptor sourcePd = getPropertyDescriptor(source.getClass(), targetPd.getName());
                if (sourcePd != null) {
                    Method readMethod = sourcePd.getReadMethod();
                    if (readMethod != null && ClassUtils.isAssignable(writeMethod.getParameterTypes()[0], readMethod.getReturnType())) {
                        try {
                            if (!Modifier.isPublic(readMethod.getDeclaringClass().getModifiers())) {
                                readMethod.setAccessible(true);
                            }

                            Object value = readMethod.invoke(source);
                            if (!Modifier.isPublic(writeMethod.getDeclaringClass().getModifiers())) {
                                writeMethod.setAccessible(true);
                            }

                            writeMethod.invoke(target, value);
                        } catch (Throwable var15) {
                            throw new FatalBeanException("Could not copy property '" + targetPd.getName() + "' from source to target", var15);
                        }
                    }
                }
            }
        }
```

----

`BeanCopier` 是 `CGLIB` 提供的工具类，`Spring` 内部对它进行了封装。它提供了两种方式：一种是对两个 `bean` 中名字和类型完全相同的属性进行拷贝，另一种可以引入 `Converter`，对某些属性进行修改后拷贝。

`BeanCopier` 会生成一个代理类（在创建代理类之前会先去缓存中找以前有没有生成过这个类），通过操作`字节码`的方式，让目标对象拷贝代理类。

----

做一个简单的[测试](http://192.168.1.223/jingyang1/utiltest)，把一个对象属性拷贝1000次，看哪种方式效率更高。

经过比较可以发现，`BeanCopier` 的效率比 `BeanUtils` 高出一个数量级，和直接使用 `getter`、`setter` 方法差不多。

---
title: 钩子函数、切面编程和代理
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: 钩子函数、切面编程和代理
---

以前对*钩子函数*、*切面编程*和*动态代理*各自了解过一些内容、进行了一些实践，从来没有联合起来思考过，今天在讨论一个问题的过程中，突然发现这三者其实是为了达到同一目的的三种方法，也可以说从为达到的目的上讲是同一种东西。

Java的**元编程**能力较一些动态语言来说弱，但是Java平台开放、字节码统一，所以前人能通过各种方法实现所谓的元编程。

---

### 钩子函数

钩子函数或者叫回调函数，其实就是*挂载点*：

>是能够影响默认行为或流程的地方。

一些模板方法，比如`JdbcTemplate`包装了一些代码模板，但是会开放`PreparedStatementCallback`接口，在特定位置执行自定义行为。

```java
@Override
	public <T> T execute(PreparedStatementCreator psc, PreparedStatementCallback<T> action)
			throws DataAccessException {
		Connection con = DataSourceUtils.getConnection(getDataSource());
		PreparedStatement ps = null;
		try {
			Connection conToUse = con;
			if (this.nativeJdbcExtractor != null &&
					this.nativeJdbcExtractor.isNativeConnectionNecessaryForNativePreparedStatements()) {
				conToUse = this.nativeJdbcExtractor.getNativeConnection(con);
			}
			ps = psc.createPreparedStatement(conToUse);
			applyStatementSettings(ps);
			PreparedStatement psToUse = ps;
			if (this.nativeJdbcExtractor != null) {
				psToUse = this.nativeJdbcExtractor.getNativePreparedStatement(ps);
			}
			T result = action.doInPreparedStatement(psToUse);
			handleWarnings(ps);
			return result;
		}
		catch (SQLException ex) {
      ...
			throw getExceptionTranslator().translate("PreparedStatementCallback", sql, ex);
		}
		finally {
			...
		}
```

### 切面编程

Java的切面编程可以动态地给方法加上一些特性，最普遍的例子是`Spring`管理声明式事务的方法。事务本身和业务无关，而且大多数都是模板代码，所以Spring把它分离出来，用切面的方式自动给特定方法加上事务控制。与其他方法不同的是，这是直接操作**字节码**的方式给方法增强。

切面编程能给方法动态加入内容的时机是有限的，无非是进入方法之前或者方法返回之后，不能无限制地操作方法。

### 代理

#### 静态代理

静态代理就是用一个Java代理类去执行目标类的方法，因此在执行目标类之前或之后能加入自定义方法。

```java
public class Proxy {
    private Target target;
  
    public void doSth() {
        System.out.println("自定义内容");
        target.doSth();
        System.out.println("自定义内容");
    }
}
```

#### 动态代理

动态代理不会用实际的Java代码去实现一个代理类，而是用JDK提供的Proxy、InvocationHandler去生成代理，它要求被代理的类必须要实现接口。

```java
public class DynamicProxyTest {
    interface IHello {
        void sayHello();
    }
 
    static class Hello implements IHello {
        @Override
        public void sayHello() {
            System.out.println("hello world");
        }
    }
 
    static class DynamicProxy implements InvocationHandler {
        Object originalObj;
 
        Object bind(Object originalObj) {
            this.originalObj = originalObj;
            return Proxy.newProxyInstance(originalObj.getClass().getClassLoader(),
                    originalObj.getClass().getInterfaces(), this);
        }
 
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("自定义内容");
            return method.invoke(originalObj, args);
        }
    }
}
```

---

以上三种方式都是为了在方法执行过程中改变既定流程、加入自定义内容，在Java语言的不同层面实现了对方法的增强，但是实现方法各不相同。

---
layout: post
title:  服务器运行多个 Tomcat
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: Tomcat
---

## 一、背景
今天碰到一个需求，要在一个服务器上运行两个 Tomcat，各自部署同一套程序，用 `nginx` 代理这两个 `Tomcat`。

## 二、操作步骤
1、下载 Tomcat，并解压到两个不同的目录。

2、随意启动其中一个 Tomcat，浏览器访问 `http://localhost:8080`，看到 Tomcat 的默认页面说明启动成功。

3、关键是第二个 Tomcat，在网上搜索了一番，有三个修改 `server.xml` 的点都被提到了：
* 修改默认端口。Tomcat 默认端口是`8080`，要改成其他未被占用端口，如：`8090`。

```
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />
```

* 修改默认关闭端口。默认是`8005`。

```
<Server port="8005" shutdown="SHUTDOWN">
```

* 修改定向包协议端口。默认是`8009`。

```
<Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
```

* 注意点：不要设置 `$CATALINA_HOME` 环境变量。

做完这`3`项修改的就启动 Tomcat 的并不会成功，它只会强制关闭第一个启动的Tomcat，最终只能有一个 Tomcat 是运行状态。

4、修改 `tomcat.pid` 文件位置。
只做前`3`项修改并不能成功启动两个 Tomcat 的原因是第二个 Tomcat 产生的 `pid` 文件会覆盖第一个，最终导致第一个 Tomcat 被杀死。所以这里要做的就是防止 pid 文件`覆盖`，也就是修改默认 pid 文件的位置。

* 在 Tomcat 的 `bin` 目录下新建文件 `setenv.sh`。修改为：

```
#!/bin/sh

export CATALINA_PID=/var/run/tomcat8/tomcat.pid
```
* 把 setenv.sh 修改为可执行文件：

```
chmod 777 setenv.sh
```

`setenv.sh` 会被 `startup.sh` 调用，我们在里面修改了 pid 文件位置，所以它再也不会覆盖第一个 Tomcat 的 pid 文件。这时候再次启动就能得到两个 Tomcat 了。

## 更新
今天关闭 Tomcat 的时候，没有正常关闭，看到一个报错：
```
Tomcat did not stop in time.
PID file was not removed.
To aid diagnostics a thread dump has been written to standard out.
```
运行 ```$ps aux | grep tomcat``` 查了一下，两个 Tomcat 都没有关。于是手动杀死了这两个进程。

上网查了一下解决方案，大部分是说要强制关闭，加上参数 `-force`。

或者在 `shutdown.sh` 脚本里把：
```
exec "$PRGDIR"/"$EXECUTABLE" stop "$@"
```
改成：
```
exec "$PRGDIR"/"$EXECUTABLE" stop -force "$@"
```

---
layout: post
title: 搭建 disconf-web 环境
category: ['Java']
tags: ['Java']
author: 景阳
email: jyjsjd@hotmail.com
description: 搭建 disconf-web 环境
---

## 一、安装依赖
* MySQL
* Tomcat
* Nginx
* zookeeper
* Redis

## 二、步骤
1. 克隆 disconf 项目到本地，这里假设是 /home。把 disconf-web 目录拷贝到 /home 根目录。
2. 新建目录：
  * /home/work/dsp/disconf-rd/online-resources（存放自定义配置文件）。
  * /home/work/dsp/disconf-rd/war（deploy 目录）。
3. 拷贝 /disconf-web/profile/rd/ 目录下的文件到 /home/work/dsp/disconf-rd/online-resources。
  * 把application-demo.properties 更名为 application.properties。
  * 把application.properties的domain改为服务器地址，本地就是 localhost。
  * 一定要配置两个 redis client（可以配置同样的两个，名字不同就行了）。
  * 修改文件。
4. 建构项目：

  ```shell
  ONLINE_CONFIG_PATH=/home/work/dsp/disconf-rd/online-resources
  WAR_ROOT_PATH=/home/work/dsp/disconf-rd/war
  export ONLINE_CONFIG_PATH
  export WAR_ROOT_PATH
  cd disconf-web
  sh deploy/deploy.sh
  ```

以上步骤做完项目就构建好了。

-----

下面步骤部署项目。
1. 数据库：参考 sql/readme.md 来进行数据库的初始化。
2. 部署 war：修改server.xml， 在 Host 节点下添加`<Context path="" docBase="/home/work/dsp/disconf-rd/war"></Context>``。
3. 部署 nginx：修改 nginx.conf
  * 上游服务器是 Tomcat，默认端口808。
  * server_name 改为服务器名，本地就是 localhost。

  ```
  `upstream disconf {
      server 127.0.0.1:8080;
  }

  server {
      include     mime.types;
      default_type    application/octet-stream;

      listen   8081;
      server_name localhost;
      access_log /home/work/var/logs/disconf/access.log;
      error_log /home/work/var/logs/disconf/error.log;

      location / {
          root /home/work/dsp/disconf-rd/war/html;
          if ($query_string) {
              expires max;
          }
      }

      location ~ ^/(api|export) {
          proxy_pass_header Server;
          proxy_set_header Host $http_host;
          proxy_redirect off;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Scheme $scheme;
          proxy_pass http://disconf;
      }
  }
  ```

4. 启动 Tomcat、nginx。
5. 访问 `http://localhost:8081/`。

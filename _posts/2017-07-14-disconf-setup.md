---

title: 搭建 disconf-web 环境
category: ['Java']
tags: ['Java']
author: jyjsjd
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
以下步骤构建项目。

1. 克隆 disconf 项目到本地，这里假设是 `/home`。把 disconf-web 拷贝到 `/home` 目录。
2. 新建目录：
  * `/home/work/dsp/disconf-rd/online-resources`（存放自定义配置文件）。
  * `/home/work/dsp/disconf-rd/war`（deploy 目录）。
3. 拷贝 `/disconf-web/profile/rd/` 目录下的文件到 `/home/work/dsp/disconf-rd/online-resources`。
  * 把 `application-demo.properties` 更名为 `application.properties`。
  * 把 `application.properties` 的 `domain` 改为服务器地址，本地就是 `localhost`。
  * 一定要配置**两个** redis client（可以配置同样的两个，名字不同就行了）。
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

-----

下面步骤部署项目。

1. 数据库：参考 `sql/readme.md` 来进行数据库的初始化。
2. 部署 war：修改 `server.xml`， 在 `Host` 节点下添加 `<Context path="" docBase="/home/work/dsp/disconf-rd/war"></Context>`。
3. 修改 Nginx 配置文件 `nginx.conf`：
  * 上游服务器是 Tomcat，默认端口8080。
  * `server_name` 改为服务器名，本地就是 `localhost`。

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

-----
启动项目

1. 启动 Tomcat、Nginx。
2. 访问 `http://localhost:8081/`。

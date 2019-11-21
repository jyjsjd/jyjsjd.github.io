---

title: 漏洞扫描报告的缺失响应头
category: ['Http']
tags: ['Http']
author: jyjsjd
email: jyjsjd@hotmail.com
description: 漏洞扫描报告的缺失响应头
---

#### 1、X-Frame-Options
X-Frame-Options 响应头是告诉浏览器是否允许一个页面在`<frame>`、`<iframe>`、`<object>`中展示的标记。网站使用此功能确保自己网站内容没有被嵌入别人的网站，从而避免点击劫持攻击（clickjacking）。

* DENY：表示页面不允许在 frame 显示，包括相同域名页面。
* SAMEORIGIN：表示页面可以在相同域名页面的 frame 显示。
* ALLOW-FROM uri：表示页面可以在指定来源的 frame 显示。

#### 2、X-XSS-Protection
X-XSS-Protection 响应头在检测到跨站脚本攻击时，浏览器将停止加载页面。
* 0：禁止 XSS 过滤。
* 1：启用 XSS 过滤，如果检测到跨站脚本攻击，浏览器将清除页面不安全部分。
* 1;mode=block：启用 XSS 攻击，如果检测到攻击，浏览器将不会清除页面，而是阻止页面加载。
* 1;report=`<reporting-URI>`  (Chromium only)：启用XSS过滤。 如果检测到跨站脚本攻击，浏览器将清除页面并使用CSP report-uri指令的功能发送违规报告。

#### 3、X-Content-Type-Options
X-Content-Type-Options 响应头用来提示客户端一定要遵守在 `Content-Type` 首部中对 `MIME 类型`的设定。禁用了客户端 `MIME 嗅探`行为。

* nosniff：如果请求为以下两种，将阻止请求
  - style 但 MIME 类型不是 text/css。
  - script 但 MIME 类型不是 JavaScript MIME类型。

#### 4、Content-Security-Policy
Content-Security-Policy 响应头允许站点管理员在指定的页面控制用户代理的资源。



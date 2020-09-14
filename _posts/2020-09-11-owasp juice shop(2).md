---
layout: post
title:  "owasp juice shop"
subtitle: '二星难度'
date:   2020-09-11 18:00:00
tags: 靶场
description: '靶场'
color: 'rgb(255,215,0)'
cover: 'https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914161540665.png'
---

## 0x01 前言

这篇介绍2星题目。

## 0x02 二星题目

### 2.1 Admin Section

访问商店管理页面。找后台呗？因为之前玩过，直接输入administration，然后会返回403，使用admin账户登录后即可。

![image-20200914163349318](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914163349318.png)



### 2.2 Deprecated Interface

使用已废弃但未正常关闭的B2B接口。在投诉页面，上传xml文件即可。

![image-20200912161406777](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200912161406777.png)

### 2.3 Five-Star Feedback

删除5星反馈。进入后台删除即可。

![image-20200912160606581](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200912160606581.png)

### 2.4 Login Admin

使用admin登录（注入类）。点开页面的商品评论就能看到admin用户邮箱是admin@juice-sh.op。先试了一波万能密码，没反应，后来想到账户哪里输入会报错，试了一下，就进去了

![image-20200912152509341](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200912152509341.png)



### 2.5 Login MC SafeSearch

使用MC SafeSearch的原始用户凭据登录而不使用 SQL 注入或任何其他绕过方法.。

意思说是登录mc safesearch用户，但必须是正常的登录，那就需要获取其账号密码。他的账户为mc.safesearch@juice-sh.op。一搜就能得到结果，不多说了。PS：听着还可以。

![image-20200912160811842](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200912160811842.png)



### 2.6 Password Strength

使用管理员的用户凭据登录，但不事先更改凭据或使用SQL注入。

弱口令走一波：admin123，成功登录



### 2.7 View Basket

登录admin用户，随便点击一个商品，添加购物车就弹出成功了。



### 2.8 Security Policy

开始行动之前任何行为都应该像"白帽"一样。

security.txt，A proposed standard which allows websites to define security policies.就是一个放在网站根目录下/.well-known/security.txt的一个文件，上面放上联系方式，帮助白帽更好地联系站长纰漏安全问问题。好像还在RFC审查阶段。访问即可。

![image-20200914163147756](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914163147756.png)

### 2.9 Weird Crypto

联系商店有关它绝对不应该使用的算法或库。

在反馈页面提交MD5即可。



## 0x03 小结

1、进后台后也有隐藏的目录，该扫还是要扫的。PS：正常开发应该不会这么SB为难自己吧，可能也就存在于CTF

2、security.txt文件安全倡议
---
layout: post
title:  "owasp juice shop"
subtitle: '一星难度'
date:   2020-09-10 18:00:00
tags: 靶场
description: '靶场'
color: 'rgb(255,215,0)'
cover: 'https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914161540665.png'
---



## 0x01 前言

这个靶场刚出来时就玩过一次，当时做了有十几道题目就没在做了，因为工作原因又把它搭建了起来给新人做技能练习。同时看到好像更新了不少东西，所以打算趁着工作之余的时间把题目做一遍。弥补一下当时的遗憾。

## 0x02 环境搭建

[靶场](https://github.com/bkimminich/juice-shop)有很多种搭建方式，下面也介绍的很清楚。这里就不在赘述了。推荐使用docker和Heroku去构建这个靶场环境。

PS：Heroku还挺香的，以前没用过。这个网站可以在线托管云应用，直接注册后就可以免费生成在线的靶场环境。注册时注意国家的选择，我这里注册后选的美国，然后应用生成后能选择的服务器就只有美国，导致不挂代理访问很慢。



## 0x03 一星关卡

如果搭建好后不知道怎么上手可以看一下官方给的[攻略](https://owasp.org/www-project-juice-shop/)，可以告诉你要怎么去玩这个综合型的靶场。另外这玩意也有答案，没思路可以看一看。

### Score Board

玩这个首先要找的就是Score Board（计分板），这个可以查看当前的任务进度，可以当你黑夜里的指明灯。查看js文件搜索关键词就能看到，然后访问即可。

![image-20200902134433987](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200902134433987.png)

可以看到难度系数总共有6级，共95到题目，这里根据计分板一步步来吧。（想锻炼自己的可以纯黑盒，在自己点击页面测试过程中，一会弹出一个完成某个挑战还是很有意思的）

### DOM XSS

搜索框处XSS

![image-20200902140137836](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200902140137836.png)

但是呢，你必须用他的payload才能出发挑战成功。

![image-20200902140410527](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200902140410527.png)

### Bonus Payload

利用**<iframe>**标签插入一个链接

![image-20200902141014218](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200902141014218.png)

这他瞄的不看计分板永远都完不成的。毕竟他的判断依据不一样。

### Confidential Document

查看robots.txt文件，发现ftp目录，然后发现机密文件

![image-20200902142143390](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200902142143390.png)

### Exposed Metrics

目标是找到一个数据泄露点，不太明白，思路就是找api接口。翻找了半天后看上面计分板原来是可以点击的，跟进到Prometheus这个系统和服务监测系统。然后发现其推送数据的方式，这里把路径一一尝试后成功。

![image-20200902144429811](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200902144429811.png)

![image-20200902144457251](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200902144457251.png)

### Error Handling

随意让系统报一个错误即可完成该挑战

![image-20200910155011343](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200910155011343.png)





### Missing Encoding

目标：Retrieve the photo of Bjoern's cat in "melee combat-mode"（找回Bjoern的猫在“近战模式”中的照片）

什么鬼目标。后来经过度娘的教导，原来是url编码问题。

https://twitter.com/intent/tweet?text=😼 #zatschi #whoneedsfourlegs @owasp_juiceshop&hashtags=appsec

将这个链接中的#使用url编码后即可访问正常图片，然后解决这道题。

![image-20200914161644052](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914161644052.png)

### Outdated Whitelist

根据题目描述，全局搜索重定向标签。在各个js文件中查找**redirect?to=**即可

![image-20200910164843539](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200910164843539.png)

访问**redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6**就可以成功解决这个挑战



### Privacy Policy

阅读隐私政策，一般这个玩意不都在登录注册么。没什么好说的，注册进去就能看到。

![image-20200910165845803](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200910165845803.png)



### Repetitive Registration

注册时遵循DIR原则，DRY原则，Don’t Repeat Yourself，直译就是不要重复你自己。就是在编程中不要出现重复代码。另外与之相反的WET（直译：潮湿，因为DRY是干燥的意思）的，可以理解为Write Everything Twice（任何东西写两遍），We Enjoying Typing（我们享受敲键盘）或Waste Everyone’s Time（浪费所有人的时间）。

所以在注册时不重复输入即可。抓包，删除passwordRepeat值，即可。

![image-20200914162023542](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914162023542.png)

### Zero Stars

给一个0星。第一反应就是抓包改包了。修改**rating**的值，就行了。

![image-20200914161931796](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914161931796.png)



## 0x04 小结

已经将1星关卡全部做完了，学到了DRY原则和WET原则。其他是啥都没学到。准备下一篇，水起来。哈哈


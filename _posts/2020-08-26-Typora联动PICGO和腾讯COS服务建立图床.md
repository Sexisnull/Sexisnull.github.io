---
layout: post
title:  "Typora联动PICGO和腾讯COS服务建立图床"
subtitle: 'Typora联动PICGO和腾讯COS服务建立图床'
date:   2020-08-26 18:00:00
tags: 记录
description: '记录'
color: 'rgb(255,165,0)'
---

### 下载安装picgo软件

https://github.com/Molunerfinn/PicGo/releases/

![image-20200826165046285](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200826165046285.png)


### 开通腾讯COS服务

腾讯云会送6个月的资源包，但是不包含请求、流量等费用。先使用看看。

![image-20200826163315805](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200826163315805.png)

![image-20200826163659043](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200826163659043.png)

定义好相关配置参数

![image-20200826165849627](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200826165849627.png)

### 配置Typora

![image-20200826171249532](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200826171249532.png)

我这里默认是在本地建立文件夹保存一份，因为之前用的免费图床，总是存在过些时间就打不开的情况，建议在本地存一份，最后将图片统一上传。虽然麻烦些，但多了一层保障。



写的并不详细，如果看不懂可以自行查看picgo[配置手册](https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E8%85%BE%E8%AE%AF%E4%BA%91cos)
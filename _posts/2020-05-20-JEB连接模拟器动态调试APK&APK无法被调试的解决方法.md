---
layout: post
title:  "JEB连接模拟器动态调试APK&APK无法被调试的解决方法"
subtitle: 'JEB连接模拟器动态调试APK&APK无法被调试的解决方法'
date:   2020-05-20 18:00:00
tags: android
description: 'android'
color: 'RGB(0,191,255)'
---



#### 一、连接

adb shell 

启动的方法为

```
# am start -n 包(package)名/包名.活动(activity)名称
```

包名可以从每个应用的AndroidManifest.xml的文件中得

![image-20200529095430480.png](https://i.loli.net/2020/05/29/oW3HupFzZ8mEXsd.png)

启动命令

```
D:\tools\Nox\bin>adb shell am start -d -n com.suctf.crackme/com.suctf.crackme.MainActivity Starting: Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] dat=-n cmp=com.suctf.crackme/.MainActivity }
```

JEB附加调试时搜索不到设备

原因是因为adb环境变量未设置，设置后即可

#### 二、无法调试解决

连接后发现，说程序无法被调试

![image-20200529095643061.png](https://i.loli.net/2020/05/29/Nwm4anG3zehj7kX.png)

1） apk的Manifest.xml文件的Application的属性中包含android:debuggable=“true” ；

2）或者第一条不满足时，安卓手机的default.prop文件中ro.debuggable=1时也行，mprop工具可用于修改该属性值。

两种方式第一种通常是解包添加属性再打包，随着加壳软件以及apk校验等，容易出现安装包异常。第二种由于一般的手机发布时ro.debuggable一般是0 也就是不允许调试，通过修改rom的办法在手机上比较麻烦，需要刷机等等，模拟器上一般是vmdk的虚拟机，也没法修改rom。

- 使用mprop工具

![image-20200529105735142.png](https://i.loli.net/2020/05/29/YqEiH6jvr8bugo1.png)

看样子是成功了

![image-20200529105805689.png](https://i.loli.net/2020/05/29/e7y9SoCPtgL65E2.png)

重启后查看

cat default.prop

![image-20200529105846959.png](https://i.loli.net/2020/05/29/dQS59juz2JeRUqg.png)



还是0，但是不要纠结这里的值，直接返回JEB附加即可成功连接调试

![image-20200529105930014.png](https://i.loli.net/2020/08/05/W9PTqcydAmauMfn.png)

#### 三、动态调试

添加断点拿到v2的值就是key

![image-20200529110027230.png](https://i.loli.net/2020/05/29/xl253S7UoutVsWe.png)

然后解题即可
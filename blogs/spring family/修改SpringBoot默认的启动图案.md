---
title: 修改SpringBoot默认的启动图案
date: 2020-05-20
author: RenShiWei
categories:
 - spring family
tags:
 - springboot
---

## 修改SpringBoot默认的启动图案

### 描述

SpringBoot默认的启动图案如下图：
![在这里插入图片描述](https://cos.duktig.cn/typora/202201222327138.png)

这是官方默认的启动图案，但很多时候，我们希望可以有自己定义的个性化启动图案。

### 设置方法

#### 1.在项目`/src/main/resources`下新建`banner.txt`的文件

如下图所示：
![在这里插入图片描述](https://cos.duktig.cn/typora/202201222327273.png)

#### 2.进入网站

[http://patorjk.com/software/taag](http://patorjk.com/software/taag)

按照下图操作，选择好合适的图案并复制
![在这里插入图片描述](https://cos.duktig.cn/typora/202201222328063.png)

#### 3.将复制好的图案文本粘贴至`banner.txt`文件

如下图：
![在这里插入图片描述](https://cos.duktig.cn/typora/202201222328143.png)
如图所示，也可以添加我们希望在启动时，希望显示的文字或图案（比如版本号信息等）

#### 4.启动后，就可以看到我们预设的图案和文字了

![在这里插入图片描述](https://cos.duktig.cn/typora/202201222328529.png)


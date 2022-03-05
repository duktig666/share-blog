---
title: Mac系统下docker容器无法使用--net host共享宿主机端口的解决方案
date: 2020-10-13
categories:
 - 运维
tags:
 - docker
---

@[TOC]

## 背景

最近使用了Mac系统的电脑作为了测试服务器，但是在Mac系统的电脑使用docker安装nginx进行反向代理，以前在centos7系统的电脑上无往不利的docker容器启动方式，反而出现了问题。
启动方式：
```java
docker run -it --name nginx --net host -v /Users/mac-server/Desktop/project:/var/www/html -v /Users/mac-server/Desktop/nginx:/nginx_conf -d nginx  
```
以前在centos7的系统上容器构建后，都可以访问成功。进入nginx执行`nginx -t`，配置文件没有问题；执行`nginx -s reload`，重启nginx也没有报错。但是就是不能通过浏览器访问。

排除防火墙和80端口的问题，还是不能访问。
<br>

## 解决过程一

在经过多次卸载重装nginx容器都没能成功的情况下，就是用最常见的容器启动命令启动：
```java
docker run -it --name nginx -p 80:80 -d nginx  
```
结果浏览器可以直接进行访问了。

但是这样明显是不能满足我们的需求的，nginx需要进行反向代理的时候，未来项目的端口往往是位置的，所以使用 ==--net host共享宿主机端口== 是比较好的解决方案。

### 分析

对比上文的容器启动命令，一般来说不是-v映射目录的问题，要不启动时会报错。多以应该问题出自`--net host`上。

于是基于此进行分析，最终找到了原因。
<br>

## Mac系统下docker容器无法使用--net host共享宿主机端口的原因

### docker的网络配置

docker的网络配置分为四种,：host,overlay,macvlan,bridge

#### host模式

与宿主机共享网络，也就是在网络这块不会与宿主机隔离，而是共享宿主机的网络配置，并且 ==容器不会分配自己的ip地址==。

> 需要注意的是，因为容器是与宿主机共享网络，并且容器不存在自己的ip, 端口映射不生效, -p,--publish，-P，和--publish-all都将被忽略，并产生一个警告
> WARNING: Published ports are discarded when using host network mode

使用方法:
在创建容器时添加如下配置

```powershell
--net host
```

####  overlay模式

分布式网络模式。可参考：[https://docs.docker.com/network/overlay/](https://docs.docker.com/network/overlay/)

#### macvlan模式

直接连接宿主机的物理网络，为每个容器的虚拟网络接口分配MAC地址，相当于直接连接了宿主机的物理网络接口。

但是使用改模式需要注意以下几点：

- 会导致宿主机上有大量的MAC地址
- 需要宿主机支持一个物理接口分配多个MAC地址
- 如果应用程序可以使用bridge，overlay模式，那最好使用这两种方式建立网络

#### bridge模式

类似VMware的桥接网络，此模式会为每一个容器分配Network Namespace、设置IP等，并将一个主机上的Docker容器连接到一个虚拟网桥上。
<br>

## docker架构

### Linux的docker架构

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020101316032410.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)
docker是在linux内核容器基础上实现的，linux安装docker后，会创建一个为docker0的虚拟网卡，linux宿机与docker容器之间的通信，通过docker0虚拟网卡进行
<br>

### Mac下的docker架构
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013160416138.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)
docker在OSX的实现方式，是首先创建一个linux的虚拟机，在将docker放入到虚拟机中实现，而对于linux虚拟机，与OSX之间的通信，目前版本采用`/var/run/docker.sock`这种socket文件来通信，在OSX宿机中自然ping不通docker容器。
<br>

### Mac系统对docker的限制

参考：[https://docs.docker.com/docker-for-mac/networking/](https://docs.docker.com/docker-for-mac/networking/)
- 因为MacOS无法访问Docker桥接网络，而恰恰Docker默认是使用bridge模式，所以导致Docker无法联网，并且无法与宿主机沟通。

- Host主机网络驱动程序仅适用于Linux主机，并且不支持Docker for Mac，Docker for Windows或Docker EE for Windows Server。

==所以docker容器无法使用--net host共享宿主机端口==。
<br>

## 解决无法使用--net host的方案

docker容器使用`--net host`共享宿主机端口，无非是因为在未来使用容器的过程中，宿主机与容器通信的端口不能确定。既然`--net host`不能使用，不能共享宿主机端口，那么我们可以寻找一些替代方案。

### docker映射某个范围内的端口列表代替--net host共享宿主机端口

**不管在==Dockerfile==、==命令行==或==docker-compose.yml==中，都可以使用类似于`8080-8090:8080-8090`的格式，来映射多个端口**

#### docker-compose.yml

```powershell
#create by winton wang
version: '3.6'
services:
  web:
    image: nginx:1.18
    ports:
      # 将会映射8080到8090这个范围内的端口
      - 8080-8090:8080-8090
    volumes:
      - ./www:/www
```

#### 命令行

```powershell
docker run -p 8080-8090:8080-8090 nginx
```
#### Dockerfile

```powershell
EXPOSE 8080-8090
```

**注意：**
***使用这种形式去映射大范围的端口，会占用用户大量的内存，尽量不要这样子做***

### 修改nginx容器的启动方式，映射端口列表

```powershell
docker run -it --name nginx -p 80:80 -p 7000-8000:7000-8000  -v /Users/mac-server/Desktop/project:/var/www/html -v /Users/mac-server/Desktop/nginx:/nginx_conf -d nginx 
```
- 使用不常用的7000-8000端口，用于nginx的反向代理未来的项目，当然端口范围可根据实际情况修改。
- 如果这样做了，7000-8000端口就会都被占用，所以慎用。
- 如果7000-8000有端口已经被占用，则容器启动失败。

## 参考：

- [Mac 下Docker无法访问外网与宿主机(解决办法和原因)](https://blog.csdn.net/qq_35371031/article/details/104601403?utm_medium=distribute.pc_aggpage_search_result.none-task-blog-2~all~first_rank_v2~rank_v25-5-104601403.nonecase&utm_term=docker%20host%E6%A8%A1%E5%BC%8F%20mac&spm=1000.2123.3001.4430)
- [Mac Docker Host模式不能用](https://blog.csdn.net/devday/article/details/104200291)
- [MAC DOCKER无法ping通容器解决方案](https://blog.csdn.net/Mr0o0rM/article/details/80683115?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.channel_param&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.channel_param)
- [docker 映射某个范围内的端口列表](https://blog.csdn.net/qq_26683009/article/details/108263510?utm_medium=distribute.pc_aggpage_search_result.none-task-blog-2~all~sobaiduend~default-5-108263510.nonecase&utm_term=docker%E7%9A%84%E6%98%A0%E5%B0%84%E7%AB%AF%E5%8F%A3%E8%8C%83%E5%9B%B4&spm=1000.2123.3001.4430)
---
title: OpenFeign
date: 2021-08-05
publish: false
---

## 远程调用的流程

![img](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202201151957953.png)

生产者端流程：

1. 加载服务接口，并缓存
2. 服务注册，将服务接口以及服务主机信息写入注册中心（本例使用的是 zookeeper)
3. 启动网络服务器并监听
4. 反射，本地调用

消费者端流程：

1. 代理服务接口生成代理对象
2. 服务发现（连接 zookeeper，拿到服务地址列表，通过客户端负载策略获取合适的服务地址）
3. 远程方法调用（本例通过 Netty，发送消息，并获取响应结果）

## 实现一个RPC框架需要考虑哪些因素？

**1、注册中心**

各个服务需要注册到注册中心，注册中心统一管理服务列表，远程调用时通过服务发现机制去获取目标服务的地址。

调用方需要将注册中心的服务地址进行缓存。

注册中心的服务地址发生变更需要通知客户端。

**2、网络通信**

网络通信涉及 **序列化、反序列化以及编解码**，服务调用时进行参数传递，可采用高效的json序列化方式。

网络通信框架可采用 Netty

通信协议根据需要进行选择

**3、负载均衡策略**

一般来说，每个服务有多个实例，远程调用时获取生产者地址时，要有一定的负载均衡策略，常用的有 随机、轮询等策略。

**4、动态代理**

例如 Dubbo 提供的是`基于接口的远程方法调用`，即客户端只需要知道接口的定义即可调用远程服务。在 Java 中接口并不能直接调用实例方法，必须通过其实现类对象来完成此操作，这意味着客户端必须为这些接口生成`代理对象`，对此 Java 提供了 `Proxy`、`InvocationHandler` 生成动态代理的支持；生成了代理对象，那么每个具体的发方法是怎么调用的呢？jdk 动态代理生成的代理对象调用指定方法时实际会执行 `InvocationHandler` 中定义的 `#invoke` 方法，在该方法中完成远程方法调用并获取结果。

**5、失败重试机制**

一次远程调用不一定成功，可能存在网络等问题，导致调用失败。

调用失败后，一般不能直接返回失败，在 **一定的时间/次数内** 进行失败重试。

**6、限流/熔断**

服务间的调用也要有一定的限流和熔断策略，来保证服务的可靠性。



## 参看

- [浅析 RPC 与基本实现](https://xiaomi-info.github.io/2020/03/02/rpc-achieve/)
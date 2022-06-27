---
title: 以太坊“共识层”客户端prysm和teku对比选型
date: 2022-06-27
categories:
 - 区块链
tags:
 - blockchain
 - ethereum 
---

::: tip

ethereum”共识层”的客户端有prysm、teku、nimbus、light house等，那么我们该如何选型？

本文挑选出了比较热门的prysm（go实现）、teku（java实现）两个客户端进行对比实现。

:::



<!-- more -->



teku：

- https://docs.teku.consensys.net/en/latest/
- https://github.com/Consensys/teku/

prysm：

- https://docs.prylabs.network/docs/getting-started/
- https://github.com/prysmaticlabs/prysm



> 客户端在三个不同的硬件平台上的表现，一个标准节点、一个胖节点和一个Raspberry Pi 4b。各类型节点的硬件配置如表1所示。
>
> ![img](https://cos.duktig.cn/typora/3d8bf823632ad5471a224c95056609d7.png)
>
> - Prysm: 2.0.6
> - Teku: 22.3.2



### 性能分析

#### CPU

大多数CL客户端在标准节点上对CPU的使用都很合理，teku高于prysm。

![img](https://cos.duktig.cn/typora/7303d4eed0d9be909f4e5adc2a7e1748.png)

#### memory

Lighthouse的内存消耗持续增加，直到客户端崩溃。

teku和prysm内存使用情况接近；prysm在启动初期使用较少的内存，并持续增加直至平稳。

![img](https://cos.duktig.cn/typora/e194040a4a35363ea9999f8ff4ee0f68.png)

#### 磁盘

##### 磁盘占用

teku最少的磁盘占用，prysm大概是teku的两倍。

![img](https://cos.duktig.cn/typora/1b16c5e5903aec67502070e552cc2f60.png)

##### 磁盘写入

Prysm，在同步过程开始时，每秒的磁盘写入操作次数较多，这一数字逐渐减少，直到Altair之后趋于平稳。

![img](https://cos.duktig.cn/typora/0306929d923ab6a4b7d5c6ad9604a73e.png)

> 这可以解释为，在Beacon链的初期，验证者的数量远低于今天，而这些时段的时隙处理速度要快得多。这两个数字是相关的，正如我们在 图磁盘占用 中所看到的，随着网络中验证者和证明数量的增加，磁盘使用量的增长在前半段相当低，在后半段则加速。

##### 磁盘读取

![img](https://cos.duktig.cn/typora/f409d472534cdad4e738f08b65104d8b.png)

关于每秒磁盘读取操作，在某个时刻，磁盘读取操作会急剧增加，这在除了Teku的大多数CL客户端中都可以观察到。

最明显暴露出这种行为的客户端是Prysm。



#### 同步速度

>  同时尝试了两种方法，即从genesis同步和从检查点同步。这是一个有争议的观点，因为许多人表示，从genesis测量的同步速度不应该相关，还有人说，不管主观性多弱，从genesis开始同步仍然是该领域最常见的做法。

![img](https://cos.duktig.cn/typora/aaa334e66698331de73a040d1b925a9c.png)

#### 网络带宽利用率

Teku占用比所有客户端更多的带宽，当启用all-topics选项时，这一点尤其明显。我们已经与Teku团队分享了这些发现，他们正在调查这种高网络活动。Teku团队报告称，自v22.5.1更新以来，CPU减少了25%，输出带宽减少了38%。

![img](https://cos.duktig.cn/typora/c20504b773240b45f084a7bbc5da08c5.png)



#### 存档模式

存档模式是一种配置，在这种配置中，客户端存储了许多中间状态，以便能够轻松地回答关于区块链历史上任何时间的查询。这在设置区块资源管理器或一些类似的API时特别有用。我们向四个CL客户端发送了数千个请求，并记录了它们的响应时间。

在这方面最慢的客户端是Prysm，因为他们只支持部分标准API，所以他们将查询转换为gRPC上的另一个接口，这增加了一定的开销。

到目前为止，在存档模式下回答查询的所有客户端中，速度最快的是Teku，其响应时间非常快且稳定。在与Teku团队的交谈中，他们向我们解释说，他们开发了一种新的极其快速的树状结构状态存储来快速回答查询，这对Infura团队来说尤其有趣。



#### 综合性能

##### prysm

Prysm显然是拥有最佳用户体验的客户端。它非常易于使用并部署在默认配置上。Prysmatic团队在改善用户体验方面付出了巨大的努力。

Prysm在几个方面还有优化的空间。文档门户有待改进，搜索功能不是很直观。此外，它们使用gRPC，标准的HTTP API被重定向到gRPC，这显示出了低性能，甚至在同时执行多个请求时出现了崩溃。存档模式下的同步比其他客户端花费了更多时间。

##### teku

Teku似乎是最稳定的客户端之一，它具有非常完整的文档，在其中可以很容易地找到任何执行选项和命令行标志。此外，它是存储需求最低的客户端，存档模式在所有客户端中具有最快的API响应时间。

然而，尽管响应时间很快，但在存档模式下同步需要很长时间(超过3周)。另外，正确设置JVM以避免内存问题并不总是那么容易。



### 社区活跃度

![image-20220627105751911](https://cos.duktig.cn/typora/image-20220627105751911.png)

![image-20220627105823553](https://cos.duktig.cn/typora/image-20220627105823553.png)

相对而言，prysm有更强的社区活跃度。

但teku的开发团队ConsenSys又是infura的开发团队。



### 文档完备性

主观体验，teku的文档更加完善，每一个命令都能更好的在官方文档找到解释和示例。

官方文档中也有很多关于安全性、性能优化的配置。

![image-20220627110209460](https://cos.duktig.cn/typora/image-20220627110209460.png)





### 安全性

prysm和teku都支持远程签名校验。但是：

- prysm只能使用第三方的服务，还要在第三方服务中开发一定的代码，提高了复杂度。
- teku有官方支持的远程签名服务——[**Web3Signer**](https://docs.web3signer.consensys.net/en/latest/)



### Kotal支持

kotal的代码对teku支持的更加友好。

测试网：

- prysm支持的测试网是 pyrmont，这个测试网已经渐渐失去了维护。如果需要支持 prater，需要从创世文件导入，即执行命令 `--genesis-state`，需要开发kotal对其进行支持（k8s init容器操作）
- teku支持的比较友好，在k8s中正常同步

镜像：

- prysm使用的是kotal自己的镜像
- teku使用的是官方镜像，集成性更好。



## 综合选择

验证者节点关注的最重要的点是 **安全性** 和 **可用行**。

teku有比较好的稳定性，安全性有官方维护的远程签名校验服务，更加友好的文档，以及kotal比较好的支持。

所以综合对比，以太坊“共识层”选择teku客户端。



## 参看

- [以太坊2.0共识客户端的分析](https://foresightnews.pro/article/detail/6767) 
- https://docs.teku.consensys.net/en/latest/
- https://github.com/Consensys/teku/
- https://docs.web3signer.consensys.net/en/latest/
- https://docs.prylabs.network/docs/getting-started/
- https://github.com/prysmaticlabs/prysm


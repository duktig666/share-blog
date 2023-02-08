---
title: ETH Distributed Validators(DV)
date: 2022-11-27
categories:
 - 区块链
tags:
 - blockchain
 - ethereum 
---



::: tip

传统 Ethereum validator client 有单节点故障问题，会引发质押的ETH的惩罚、甚至退网。分布式验证器技术（DVT）会成为接下来 Ethereum 的一个重点。

:::

<!-- more -->



## Distributed Validators

在 **[Vitalik 发布以太坊最新路线六大关键路线](https://www.chaincatcher.com/article/2082160)** 中的 **The Merge** 部分提到了—— **Distributed Validators（DV）**，分布式验证器技术。

![dv](https://cos.duktig.cn/typora/dv.jpg)



旨在将以太坊验证者的工作分布到一组分布式节点中的技术，与目前在一台机器上运行验证者客户单的传统技术相比，更加能够提高安全性、在线弹性等。

具体参看 **[DV 技术规范](https://github.com/ethereum/distributed-validator-specs)**。

DV技术主要实现 —— [SSV](https://ssv.network/)（[与Prysm 以太坊客户端](https://github.com/prysmaticlabs/prysm)交互的 DV 协议的 Go 实现。）

SSV仓库 原本由 [ethereum/**ssv**](https://github.com/ethereum/ssv) 官方维护，后转为由 [bloxapp/ssv](https://github.com/bloxapp/ssv) 维护。



### ***M-of-N*阈值签名 解读**

N个节点在M个正确的节点上即可运行。

- BFT 共识协议 `M = ceil(2 * N / 3)`
    - ceil函数：返回大于或者等于指定表达式的最小整数
    - 如果 `N=4` ，那么 `2 * N / 3 = 2.67` ，即 `M = 3`
- 领导者安全规范协议：在*M*个正确的节点上成功运行，不超过`F = (N-1)/3`拜占庭节点，并且不超过*N。 (F 代表最大故障节点数)*
- [ssv中的实现](https://docs.ssv.network/learn/introduction/tech-overview)： `n >= 3f + 1`    `k = 2f + 1`
    - 与上述 领导者安全规范协议 一致
    - n为总数 f为最大故障数 k为最少正确运行节点数
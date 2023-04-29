---
title: Solidity 入门资源
date: 2023-04-29
categories:
- web3
tags:
- blockchain
- solidity
- web3
permalink: /web3/solidity-started-resource
---



::: tip

随着Web3发展趋势逐渐上升，Solidity这门智能合约编程语言的需求也在逐日增高，本文主要讲述Solidity入门主要需要的资源。

:::

<!-- more -->



# Solidity 入门资源

## Solidity

中文文档：[https://learnblockchain.cn/docs/solidity/](https://learnblockchain.cn/docs/solidity/)

## 智能合约框架

- Foundry：[https://book.getfoundry.sh/](https://book.getfoundry.sh/)
    - 使用原生solidity编写部署和测试，更接近EVM底层
    - rust实现，快 ，测试可以直接观察堆栈和每一个方法的调用以及gas消耗
    - 更加好用
- Hardhat：[https://hardhat.org/docs](https://hardhat.org/docs)
    - 需要使用ethers.js编写部署和测试的脚本
    - 老牌框架，社区和生态更加友好

但是两个框架也可以混用，建议先搭建Hardhat，然后集成Foundry：**[与 Hardhat 集成](https://book.getfoundry.sh/config/hardhat#integrating-with-hardhat)**

## 智能合约库

openzeppelin: [https://docs.openzeppelin.com/](https://docs.openzeppelin.com/)

- 可升级合约仓库：https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable
- 不可升级合约仓库：https://github.com/OpenZeppelin/openzeppelin-contracts

## 合约升级

### 背景

可升级合约和不可升级合约。

特性：代码一旦部署，就将确定下来，不可更改。

但是如果合约有bug，或者不完善，怎么办？

提出了可升级合约，可以升级部分代码。

### 升级规则

对于可升级合约，在编写新版本的逻辑合约时：

1. 不能更改状态变量的类型
2. 不能更改声明状态的顺序
3. 不能删除现有状态变量
4. 不能在现有状态变量之前引入新的状态变量

能对状态变量做的修改，差不多就仅是 “在以前状态变量后面增加新的状态变量了”。

总结：新增变量，函数都可以增删改。

### 可升级合约的编写

参看：[https://blog.logrocket.com/using-uups-proxy-pattern-upgrade-smart-contracts/](https://blog.logrocket.com/using-uups-proxy-pattern-upgrade-smart-contracts/)

一般会使用uups升级智能合约，使用UpgradeableBeacon来升级工厂合约创建的合约。

## 智能合约调用

### JS/TS

ethers.js（官方）: [https://learnblockchain.cn/ethers_v5/](https://learnblockchain.cn/ethers_v5/)  

web3.js: [https://learnblockchain.cn/docs/web3.js/](https://learnblockchain.cn/docs/web3.js/)

### golang

go-ethereum(geth):

- 文档：[https://geth.ethereum.org/docs](https://geth.ethereum.org/docs)
- github：https://github.com/ethereum/go-ethereum



## 智能合约交易模拟和分析

- Tenderly：https://dashboard.tenderly.co/
  - 可进行交易模拟
  - 分析链上交易的堆栈和报错调试



## 编辑器

在线remix：[http://remix.ethereum.org/](http://remix.ethereum.org/)



## ETH区块浏览器

- 执行层 etherscan：https://etherscan.io/
- 共识层 beaconcha：https://beaconcha.in/



## ETH节点

api文档：

- 执行层：[Ethereum JSON-RPC](https://ethereum.github.io/execution-apis/api-documentation/)
- 共识层：[Beacon-API](https://ethereum.github.io/beacon-APIs/)

节点：

- infura：[https://www.infura.io/zh](https://www.infura.io/zh)
- Alchemy: [https://www.alchemy.com/](https://www.alchemy.com/)

例如请求账户余额：

```bash
curl -X POST -H 'content-type: application/json' --data  '{"jsonrpc":"2.0","method":"eth_getBalance","params":["<YOUR ADDRESS>",<BLOCK(finalized)>],"id":1}' <YOUR ETH Execution layer http ADDR (infura)>

websocat <> <YOUR ETH Execution layer websocket ADDR (infura)>
> {"jsonrpc":"2.0","method":"eth_getBalance","params":["<YOUR ADDRESS>",<BLOCK(finalized)>],"id":1}
```


---
title: polkadot如何获取peerCount和blockHeight？
date: 2022-06-07 
categories:
 - 区块链
tags:
 - blockchain
 - polkadot
 - substrate 
---



::: tip

搭建 polkadot 的基础设施，即polkadot的全节点运行起来后，获取其运行的必要信息——peerCount和blockHeight是判断polkadot节点是否可以正常运行的重要依据。

本文主要讲述polkadot节点如何获取peerCount和blockHeight信息，以及遇到的问题和如何解决的。

:::



<!-- more -->



> 本文首发于：[duktig.cn](https://www.duktig.cn/)
>
> Polkadot 相关内容来自于对官方文档的分析，还有github提的issues，以及不断的测试和验证。



## 节点启动验证

**日志中可以看到peers和blockHeight的信息：**

```
2022-05-20 08:14:05 ⚙️ Syncing 234.0 bps, target=#10384146 (42 peers), best: #6524358 (0x71e1…0fe3), finalized #6523904 (0x232a…19cf), ⬇ 11.8kiB/s ⬆ 1.8kiB/s
2022-05-20 08:14:10 ⚙️ Syncing 234.0 bps, target=#10384147 (42 peers), best: #6525528 (0x9654…7613), finalized #6525440 (0x70d7…4fd7), ⬇ 247.0kiB/s ⬆ 1.4kiB/s
2022-05-20 08:14:15 ⚙️ Syncing 236.0 bps, target=#10384148 (42 peers), best: #6526708 (0x5dd9…e5e6), finalized #6526464 (0x1b4c…7a4d), ⬇ 2.1kiB/s ⬆ 1.0kiB/s
```

即正常情况下，外部应该可以通过JSON-RPC的方式来进行获取。



## 获取polkadot节点信息的方式——JSON-RPC

想要获取运行中polkadot节点信息的主要方式是 **JSON-RPC**。

参考文档为：[pokadot.js JSON-RPC](https://polkadot.js.org/docs/substrate/rpc)

### 如何找到我们需要的RPC方法？

从文档中我们可以得知，和获取peer信息相关的RPC方法主要有：

- eth/net分组下的 `net_peerCount`
- system分组下的 `system_peers`

获取blockHeight的信息主要有 chain 分组下的：

- `chain_getBlock`
- `chain_getHeader`

可参看：[Polkadot同步节点安装部署-CSDN](https://blog.csdn.net/baidu_38432732/article/details/112891185)

> 获取blockHeight，主要获取 **全网最新高度** 和 **当前节点同步的高度**。



### 验证这些方法是否满足需求

#### 对于`net_peerCount` 方法

```sh
curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "net_peerCount", "params":[]}' http://localhost:9933
```

访问报错：

```json
{"code":-32601,"message":"Method not found"}
```

`net_peerCount` 目前无法在polkadot主网下获取 peers count。其是在 [pokadot.js JSON-RPC](https://polkadot.js.org/docs/substrate/rpc) 下 `eth/net` 分组下的，是用来兼容eth的。

具体原因参看issues：

- [Can Polkadot use the RPCAPI parameter to control the RPC method like ETH? ](https://github.com/paritytech/substrate/issues/11508)
- [JSON-RPC method not found. code:-32601](https://github.com/paritytech/substrate/issues/11509)

#### 对于 `system_peers` 方法

```sh
curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "system_peers", "params":[]}' http://localhost:9933
```

polkadot默认方式启动下，是不能访问 `system_peers` 方法的。

**`system_peers` 必须在`Unsafe`模式下才可以调用，否则报错：**

```sh
{"jsonrpc":"2.0","error":{"code":-32601,"message":"RPC call is unsafe to be called externally"},"id":1}
```

即启动添加参数：

```sh
--rpc-methods=unsafe
```

之后可以访问到的结果：

```json
{
    "jsonrpc":"2.0",
    "result":[
        {
            "peerId":"12D3KooWGiRCWsE6YjYFQ75eugLKCEpso6cZZCVCZqnpouUYDHZN",
            "roles":"AUTHORITY",
            "bestHash":"0xdb22a5ee154ad1021633b0b6624daa9ebbfecbafe462f1114292849c9f621e64",
            "bestNumber":5787518
        },
        {
            "peerId":"12D3KooWMnwKPEAhYvT7YJbGnRsqzHHB2qPVcfiV1tj9dvmJFfrV",
            "roles":"AUTHORITY",
            "bestHash":"0x4f29a7c292c0581a87d99d934f236449416cb2819661c74f5b12e1e209ba8fad",
            "bestNumber":10430150
        },
        {
            "peerId":"12D3KooWQCxNC2RuxqUuYPiFzWhSCcs2NFWrENvAwm1eS3fYj6VL",
            "roles":"AUTHORITY",
            "bestHash":"0x4f29a7c292c0581a87d99d934f236449416cb2819661c74f5b12e1e209ba8fad",
            "bestNumber":10430150
        }
    ],
    "id":1
}
```

可以根据集合的元素个数来判断 peer count。



#### 对于 `chain_getBlock` 和 `chain_getHeader` 方法

**这两个方法都只能获取 当前节点同步的高度，但是不能获取到 全网的最新高度。**

请求：

```sh
curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getHeader", "params":[]}' http://localhost:9933
```

结果：

```json
{
    "jsonrpc":"2.0",
    "result":{
        "digest":{
            "logs":[
                "0x0642414245b5010300000000f8d7cd0f00000000965d164ace5a9f321c2ab9b55f246340f33263e926f6d910f73262aee37a0d18664a69e171cf9d56d36df9758f6986df7483c4d143b1e10e7b551192f326570c42921e788b2db48a9ddaab67cbd00f6ac432c34b2065ca015b5eeca14c585303",
                "0x05424142450101c6307d3addfb0fbfefcf9336e44dd24451bafa1fb0c76c9e7e9c9cf93fb61b1942adcf9011c09e1f52dc581331f641693bfc5e0baabb6acf64e2ff3e73a79686"
            ]
        },
        "extrinsicsRoot":"0x749b2464ec2d5ca5aac650aa7739aac6903ff1bb44d53c1d2e260d14563b4f95",
        "number":"0xf95c",
        "parentHash":"0x6744e2d86a815994ad790cb66928eff742d80609537de7f9b79d9eceacb44960",
        "stateRoot":"0x037aef36131072a8567ce2f5d7a613a568e64f0597c572568d2fa4ea99d439ff"
    },
    "id":1
}
```

`number` 为最新区块高度（十六进制），转成十进制



请求：

```sh
curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getBlock", "params":[]}' http://localhost:9933
```

结果：

```json
{
    "jsonrpc":"2.0",
    "result":{
        "block":{
            "extrinsics":[
                "0x280403000ba04ca2667201",
                "0x1c040a009e950300",
                "0x1004140000"
            ],
            "header":{
                "digest":{
                    "logs":[
                        "0x0642414245b501030400000006c4cd0f0000000088f6b58b505f01c8c7911a48b40f2cc991557424187852e28d66c26a41c7a15d3541b609afbd96aafe94aec8aa51febc625028963756098cf4932a311901a50f5946c119006a90a86abcef36491183b6e81af1f0bb45055bac1a041208954a01",
                        "0x0542414245010150239c85981daa8144a99bd282c9c380541f89c8ad999bb31f11c4190c0cf65123553d5c5f953d418ee802ab366e942919fab6bd6389368eac56f91d56b90588"
                    ]
                },
                "extrinsicsRoot":"0x14c48c657972257ca625078998f00eb9a36df08f5a1ac0fb657da8d49d860105",
                "number":"0xe56a",
                "parentHash":"0xcfc0e06c184b5e01c151ee74d5da7cd61cafaf63bd3e743d451a78ce3ba58606",
                "stateRoot":"0xbb25583075e34534027ecd23ec5293724e31c06c2ee8d4ad9e58f7699084492c"
            }
        },
        "justification":null
    },
    "id":1
}
```

`number` 为当前区块高度（十六进制），转成十进制



### 小结

目前我们可以通过 `unsafe` 的方式获取peerCount，和获取当前节点同步的高度，无法获取 全网最新的高度。

全网最新节点高度可参看 polkadot的区块浏览器：[https://explorer.polkascan.io/polkadot](https://explorer.polkascan.io/polkadot)

![image-20220607214654241](https://cos.duktig.cn/typora/image-20220607214654241.png)

## 继续调研

经过多方调研，最终能入手的其实还是 [pokadot.js JSON-RPC](https://polkadot.js.org/docs/substrate/rpc)  文档。

最终在推测排查下找到了想要的 RPC方法：

- `system_health`：获取peerCount
- `system_syncState`：获取区块高度信息

> 要以 `--rpc-methods=unsafe` 的方式访问



## 最终方案

### 获取peerCount

```sh
curl -X POST -H "Content-Type: application/json" -H'x-auth-token:6a9446d97c7e4ec6bfe7300a88520ba7'  --data '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' http://polkadot-polkadot-10104.originblock.info
```

结果：

```sh
{"jsonrpc":"2.0","result":{"peers":41,"isSyncing":true,"shouldHavePeers":true},"id":32}
```

- `isSyncing`：是否同步完成
- `peers`：peerCount

### 获取区块高度信息

```sh
curl -X POST -H "Content-Type: application/json" -H'x-auth-token:6a9446d97c7e4ec6bfe7300a88520ba7'  --data '{"id":1, "jsonrpc":"2.0", "method": "system_syncState", "params":[]}' http://polkadot-polkadot-10104.originblock.info
```

结果：

```sh
{"jsonrpc":"2.0","result":{"startingBlock":0,"currentBlock":6321799,"highestBlock":10525440},"id":1}
```

- `highestBlock`：为全网最新的区块高度
- `currentBlock`：为当前polkadot节点同步的高度
- `startingBlock`：为开始同步的区块高度



## 参看

- [https://wiki.polkadot.network/](https://wiki.polkadot.network/) （polkadot官方文档）
- [pokadot.js JSON-RPC](https://polkadot.js.org/docs/substrate/rpc) （官方的文档）
- [Can Polkadot use the RPCAPI parameter to control the RPC method like ETH? ](https://github.com/paritytech/substrate/issues/11508)  （我提的issues）
- [JSON-RPC method not found. code:-32601](https://github.com/paritytech/substrate/issues/11509) （我提的issues）
- [https://explorer.polkascan.io/polkadot](https://explorer.polkascan.io/polkadot) （polkadot的区块浏览器）
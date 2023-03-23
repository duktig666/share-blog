---
title: ETH 上海升级解读
date: 2023-03-01
categories:
- 区块链
  tags:
- blockchain
- ethereum
---

# ETH 上海升级

> **[验证者必读：ETH 提款 FAQ](https://mp.weixin.qq.com/s/rgTIdTCDBoZgVtQnvrfBqA)**
> 

> 上海升级最关键的内容是将允许撤回自 2020 年 12 月以来锁定质押在信标链上的 1645 万枚 ETH。
**若质押者只想取出共识奖励，可以很快处理，无需排队**。也就是说，去两年质押获得的总奖励（约 100 万枚 ETH）可以立即撤回。
若质押者要将每个节点的 32ETH 连同奖励全部提走，则属于退出共识层，涉及到网络安全，需要排队等待。**目前，ETH 节点总数为 50+ 万，则按照此数据推算，上海升级后每天最多可以退 1800 个节点（57600 枚 ETH）。**
> 

> **质押提取测试网zhejiang：**
2 月 1 号，Zhejiang 公共测试网允许以太坊用户模拟撤回质押的 ETH 的过程。Zhejiang 公共测试网于 2 月 1 日上午 10 点启动，将使验证者有机会在模拟版本的以太坊上进行撤回功能，以模仿上海升级的过程。
具体参看：[https://zhejiang.launchpad.ethereum.org/en/](https://zhejiang.launchpad.ethereum.org/en/)

sepolia将于 `2/28/2023, 4:04:48 AM UTC` 进行上海升级
> 

> 启用提款后，以太坊将开始处理部分提款；扫描验证者并将奖励分配给 0x01 池中的验证者。同时，请求将其凭证切换到 0x01 的 0x00 池验证者将开始填充 0x01 池。**这两种操作都以每个区块 16 个验证者的速度进行**。
> 

## 两类凭证

主要变化：

- 两类取款凭证之间切换的控制流程已经明确。
- 所有提款都需要 0x01 凭证，这不是由早期验证者设置的；
- 添加 0x01 取款凭证的操作速率限制为每个区块 16 次；
- 所有 0x01 凭证验证者将自动进行部分取款，每个区块最多处理 16 次部分取款。
- 全部提款的过程不变，但 0x00 验证者必须在处理提款前设置其 0x01 凭凭证。

0x00：资金会一直锁定在验证者账户中，直到提供取款地址为止。

0x01：自动接受共识层提款

提款地址只能设置一次，设置后无法再进行更改。

## 质押奖励（部分提款）

**有效余额上限为 32 ETH 的活跃验证者账户会自动处理奖励支付**。

通过奖励赚取的任何超过 32 ETH 的余额实际上并不会增加本金，也不会增加该验证者在网络上的权重，因此每隔几天就会自动提取作为奖励付款。除了一次性提供提款地址外，这些奖励不需要验证者操作员采取任何行动。这一切都是在共识层发起的，因此任何一步都**不需要gas**（交易费）。

**无法提取自定义金额**。

## 退出validator（全额提款）

在从验证者账户余额中转出任何资金之前，需要提供提款地址（0x01凭证）。

希望完全退出质押并取回全部余额的用户还必须签署并广播带有验证器密钥的“自愿退出”消息（**全额提款无法自动发生**），这将启动退出质押的过程。这是通过您的验证器客户端完成并提交给您的信标节点，并且不需要gas。

> 全额提款的流程保持不变。你可以在[此处](https://dune.com/queries/1924507)实时跟踪流失限制，但提款开始时平衡的流失限制商数可能是 8，这表明每天可以通过全额提款提取 57,600 ETH。
一个用来激活新的验证者和验证者退出的队列将出现。双端队列会将流失限制和有效验证者计数锁定在一个值，直到队列的一侧消退。
> 

完全退出时validator在信标链的 `status` 变化：

1. 退出前：active_ongoing
2. 触发完全退出后：active_exiting
3. 完全退出后：withdrawal_possible
4. 全部提现完成后：withdrawal_done

完整变化参看：[https://notes.ethereum.org/@launchpad/withdrawals-guide#Output](https://notes.ethereum.org/@launchpad/withdrawals-guide#Output)

## 提款运作原理

### 1. 验证者”扫描”

给定的验证者是否有资格提款取决于验证者帐户本身的状态。在任何给定时间都不需要用户输入来确定一个帐户是否应该发起提款——**整个过程由共识层在连续循环中自动完成**。

当一个验证者被安排提议下一个区块时，它需要建立一个提款队列，最多 16 个符合条件的提款。这是通过最初从验证器索引 0 开始，根据协议规则确定该帐户是否有合格的提款，如果有则将其添加到队列中来完成的。提议下一个区块的验证器将从上一个区块停止的地方继续，无限期地按顺序进行。

> 模拟时钟类似的原理，从0时到12时，继续从12时到0时进行无限循环。
> 

### 2. 检查提款账户

当提议者扫描验证者以寻找可能的提款时，每个被检查的验证者都会根据一系列简短的问题进行评估，以确定是否应触发提款，如果是，应提取多少 ETH。

1. **是否已提供提款地址？**
    
    如果未提供提款地址，则跳过该帐户并且不会启动提款。
    
2. **验证者是否退出并可撤回？**
    
    如果验证者已经完全退出，并且我们已经到了他们的账户被认为是“可提取”的时期，那么将处理完全提取。这会将全部余额转移到提款地址。
    
3. **有效余额是否在 32 时达到最大值？**
    
    如果账户有提现凭证，未完全退出，且有32以上奖励等待，则处理部分提现，仅将32以上奖励转入用户提现地址。
    

### 3. 无需gas

这种提取质押的方法避免了要求质押者手动提交请求提取特定数量的 ETH 的交易。这也意味着不需要**gas（交易费）**，取款也不会竞争现有的执行层块空间。

## ****多久可以获得一次质押奖励？****

一个区块最多可以处理 16 笔提款。按照这个速度，每天可以处理 115,200 个验证者提款（假设没有遗漏区块）。如上所述，没有合格取款的验证者将被跳过，从而减少完成扫描的时间。

| 取款次数 | 完成时间 |
| --- | --- |
| 400,000 | 3.5天 |
| 500,000 | 4.3天 |
| 600,000 | 5.2天 |
| 700,000 | 6.1天 |
| 800,000 | 7.0天 |

随着网络上有更多验证者，速度会变慢。

## ETH key

### 生成 keystorev4

```bash
mkdir -p /Users/xxx/code/company/blockchain/eth2-help/goerli/my

deposit new-mnemonic \
--num_validators=3 \
--chain=goerli \
--folder=/Users/xxx/code/company/blockchain/eth2-help/goerli/my \
--keystore_password=chainup-pass \
--eth1_withdrawal_address=0x892e7c8C5E716e17……5a0de1f2fc84786 

deposit existing-mnemonic \
--mnemonic="" \
--num_validators=2 \
--validator_start_index=3 \
--chain=goerli \
--folder=/Users/xxx/code/company/blockchain/eth2-help/goerli/my \
--keystore_password=chainup-pass \
--eth1_withdrawal_address=0x892e7c8C5E716e17……5a0de1f2fc84786 
```

添加参数 `--eth1_withdrawal_address` 设置ETH1的钱包地址，可以生成 ‘0x01’ 格式的提款凭证的depositData.json

### BLS 0x00 → 0x01

**通过ethdo查看validator的提款凭证**

```bash
# 测试信标链的连通性 （Syncing: false）
ethdo --connection http://<BEACON_NODE_HTTP_API_URL> node info  

# 检查索引 361191 处验证器的提款凭证是什么
ethdo --connection http://<BEACON_NODE_HTTP_API_URL> validator info --validator=361191 --verbose

ethdo --connection http://<BEACON_NODE_HTTP_API_URL> validator info --validator=0xa49337fb938a58b932dee17570046f46abd35b4570a3ff41ac25f51bf3dd650dd144aeac5a937878dc3efb5518cbe07a --verbose
```

**生成bls_to_execution_changes文件**

[https://github.com/ethereum/staking-deposit-cli/pull/313](https://github.com/ethereum/staking-deposit-cli/pull/313)

```bash
./deposit ./staking_deposit/deposit.py --language=english generate-bls-to-execution-change \
--chain=mainnet \
--mnemonic="<YOUR MNEMONIC>" \
--bls_withdrawal_credentials_list="<YOUR OLD BLS WITHDRAWAL>" \
--validator_start_index=<THE KEY START INDEX IN EIP-2334> \
--validator_indices="<YOUR VALIDATOR INDEICES>" \
--execution_address="<THE EXECUTION ADDRESS FOR WITHDRAWALS>"
```

`--validator_indices` 代表pubkey在信标链上的索引号。

****上传到信标节点`BLSToExecutionChange`池**

```bash
curl -X POST -H “Content-type: application/json” -d @<@FILENAME DESTINATION> \
http://<BEACON_NODE_HTTP_API_URL>/eth/v1/beacon/pool/bls_to_execution_changes
```

ethdo查看验证者提款凭证信息

```bash
ethdo --connection https://api.chainup.net/ethereum2/prater/dc59a7e90f05424a81d825d033d0f2de validator info --validator=361191 --verbose
```

### 退出validator

prysm：

```bash
prysmctl validator exit --wallet-dir=<path/to/wallet> --beacon-rpc-provider=<127.0.0.1:4000>

prysmctl validator exit  --beacon-rpc-provider=<127.0.0.1:4000> validators-external-signer-url=    validators-external-signer-public-keys= 
```

1. instead of using the wallet dir you can use the `validators-external-signer-url` and `validators-external-signer-public-keys` flags for the validators that would need to be exited。

# 问题：

1. 部分提款 oracle balance 问题
2. fee奖励

## 参看

- [EIP-4895：信标链推送取款操作](https://eips.ethereum.org/EIPS/eip-4895)
- [质押提款（ethereum.org）](https://ethereum.org/zh/staking/withdrawals/)
- [zhejiang testnet Staking withdrawals（zhejiang.launchpad.ethereum.org）](https://zhejiang.launchpad.ethereum.org/en/withdrawals)
- [解读以太坊上海升级即将激活的四个 EIP](https://www.chaincatcher.com/article/2082141)
- [以太坊上海升级的作用以及带来的好处](https://www.chaincatcher.com/article/2082266)
- [数据解读以太坊合并经济学，上海升级将成为重头戏](https://www.chaincatcher.com/article/2087098)
- [数据分析上海升级后 ETH 抛压：究竟会有多少人提款？](https://www.chaincatcher.com/article/2087061)
- [ethdo-**更改取款凭据**](https://github.com/wealdtech/ethdo/blob/master/docs/changingwithdrawalcredentials.md)
- [https://notes.ethereum.org/@launchpad/withdrawals-faq](https://notes.ethereum.org/@launchpad/withdrawals-faq)
- [https://notes.ethereum.org/@launchpad/withdrawals-guide](https://notes.ethereum.org/@launchpad/withdrawals-guide)

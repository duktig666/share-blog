---
title: Solidity杂记
date: 2022-06-10
publish: false
---



## 以太坊上的 DApp 跟普通的应用程序的区别

1. 在你把智能协议传上以太坊之后，它就变得 **不可更改**, 这种永固性意味着你的代码永远不能被调整或更新。

   如果你的智能协议有任何漏洞，即使你发现了也无法补救。你只能让你的用户们放弃这个智能协议，然后转移到一个新的修复后的合约上。

2. 在 Solidity 中，你的用户想要每次执行你的 DApp 都需要支付一定的 **gas**，gas 可以用以太币购买，因此，用户每次跑 DApp 都得花费以太币。

   一个 DApp 收取多少 gas 取决于功能逻辑的复杂程度。每个操作背后，都在计算完成这个操作所需要的计算资源，（比如，存储数据就比做个加法运算贵得多）， 一次操作所需要花费的 ***gas\*** 等于这个操作背后的所有运算花销的总和。



## 为什么要用 ***gas\*** 来驱动？

以太坊就像一个巨大、缓慢、但非常安全的电脑。当你运行一个程序的时候，网络上的每一个节点都在进行相同的运算，以验证它的输出 —— 这就是所谓的“去中心化” 由于数以千计的节点同时在验证着每个功能的运行，这可以确保它的数据不会被被监控，或者被刻意修改。

可能会有用户用无限循环堵塞网络，抑或用密集运算来占用大量的网络资源，为了防止这种事情的发生，以太坊的创建者为以太坊上的资源制定了价格，想要在以太坊上运算或者存储，你需要先付费。

> 注意：如果你使用侧链，倒是不一定需要付费，比如咱们在 Loom Network 上构建的 CryptoZombies 就免费。你不会想要在以太坊主网上玩儿“魔兽世界”吧？ - 所需要的 gas 可能会买到你破产。但是你可以找个算法理念不同的侧链来玩它。我们将在以后的课程中咱们会讨论到，什么样的 DApp 应该部署在太坊主链上，什么又最好放在侧链。



## 函数修饰符

1. 我们有决定函数何时和被谁调用的可见性修饰符: `private` 意味着它只能被合约内部调用； `internal` 就像 `private` 但是也能被继承的合约调用； `external` 只能从合约外部调用；最后 `public` 可以在任何地方调用，不管是内部还是外部。
2. 我们也有状态修饰符， 告诉我们函数如何和区块链交互: `view` 告诉我们运行这个函数不会更改和保存任何数据； `pure` 告诉我们这个函数不但不会往区块链写数据，它甚至不从区块链读取数据。这两种在被从合约外部调用的时候都不花费任何gas（但是它们在被内部其他函数调用的时候将会耗费gas）。
3. 然后我们有了自定义的 `modifiers`。
4. 修饰符 `payable`，它们是一种可以接收以太的特殊函数。



## Solidity优化

当 `uint` 定义在一个 `struct` 中的时候，尽量使用最小的整数子类型以节约空间。 并且把同样类型的变量放一起（即在 struct 中将把变量按照类型依次放置），这样 Solidity 可以将存储空间最小化。

**利用 'View' 函数节省 Gas。当从外部调用一个`view`函数，是不需要支付一分 gas 的**。这是因为 `view` 函数不会真正改变区块链上的任何数据 - 它们只是读取。因此用 `view` 标记一个函数，意味着告诉 `web3.js`，运行这个函数只需要查询你的本地以太坊节点，而不需要在区块链上创建一个事务（事务需要运行在每个节点上，因此花费 gas）。

Solidity 使用`storage`(存储)是相当昂贵的，”写入“操作尤其贵。



**采用“函数”，以便于 DApp 的关键部分可以以参数形式修改。为了降低成本，不到万不得已，避免将数据写入存储。**这也会导致效率低下的编程逻辑 - 比如每次调用一个函数，都需要在 `memory`(内存) 中重建一个数组，而不是简单地将上次计算的数组给存储下来以便快速查找。

> 这是因为，无论是写入还是更改一段数据， 这都将永久性地写入区块链。”永久性“啊！需要在全球数千个节点的硬盘上存入这些数据，随着区块链的增长，拷贝份数更多，存储量也就越大。这是需要成本的！
>
> 在大多数编程语言中，遍历大数据集合都是昂贵的。但是在 Solidity 中，使用一个标记了`external view`的函数，遍历比 `storage` 要便宜太多，因为 `view` 函数不会产生任何花销。 （gas可是真金白银啊！）。







```js
/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() public {
    owner = msg.sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

```

 执行到 `onlyOwner` 中的 `_;` 语句时，程序再返回并执行。